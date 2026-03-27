import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, Image as ImageIcon, Smile, Link as LinkIcon, MoreVertical, Loader2, User, MessageCircle, ArrowLeft, CheckCircle, X } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const targetPostId = searchParams.get('post');

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null); // { profile, post_id, postDetails }
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null); // profile obj
  const [confirmingFlight, setConfirmingFlight] = useState(false);
  const prevScrollHeightRef = useRef(null);

  const EMOJIS = ['🐾', '🐶', '🐱', '✈️', '❤️', '😊', '🙌', '🙏', '🏠', '🦴'];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setCurrentUser(session.user);
      
      // Load sidebar
      const convList = await fetchConversations(session.user.id);
      
      // Handle initial target user and post from search params
      if (targetUserId) {
        const existing = convList.find(c => 
          c.profile.id === targetUserId && 
          (targetPostId ? c.lastMessage.post_id === targetPostId : !c.lastMessage.post_id)
        );

        if (existing) {
          setSelectedConv(existing);
        } else {
          // Fetch the user profile and post details to start a new chat
          const [profileRes, postRes] = await Promise.all([
            supabase.from('profiles').select('id, username, avatar_url').eq('id', targetUserId).single(),
            targetPostId ? supabase.from('posts').select('*').eq('id', targetPostId).single() : Promise.resolve({ data: null })
          ]);

          if (profileRes.data) {
            setSelectedConv({
              profile: profileRes.data,
              post_id: targetPostId,
              postDetails: postRes.data
            });
          }
        }
      }
    };
    init();
  }, []); // Only on mount

  useEffect(() => {
    if (!currentUser) return;

    // Single subscription for ALL relevant message changes
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        
        // Re-fetch conversations for sidebar if I'm involved
        if (newMsg.sender_id === currentUser.id || newMsg.receiver_id === currentUser.id) {
          fetchConversations(currentUser.id);
        }

        // If it's part of the current active conversation, append to messages
        if (selectedConv && (
          ((newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedConv.profile.id) ||
           (newMsg.sender_id === selectedConv.profile.id && newMsg.receiver_id === currentUser.id)) &&
          (newMsg.post_id === selectedConv.post_id)
        )) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, selectedConv]);

  useEffect(() => {
    if (selectedConv && currentUser) {
      setHasMore(true);
      fetchMessages(false);
      markAsRead(selectedConv.profile.id, selectedConv.post_id);
    }
  }, [selectedConv, currentUser]);

  const markAsRead = async (otherUserId, postId) => {
    if (!currentUser) return;
    const query = supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUser.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
    
    if (postId) {
      query.eq('post_id', postId);
    } else {
      query.is('post_id', null);
    }

    const { error } = await query;
    
    if (!error) {
      // Refresh sidebar to update unread indicators
      fetchConversations(currentUser.id);
    }
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    if (prevScrollHeightRef.current !== null) {
      // Restore scroll position after prepending older messages
      const newScrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop += (newScrollHeight - prevScrollHeightRef.current);
      prevScrollHeightRef.current = null;
    } else {
      // New normal message or initial load
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    if (scrollRef.current.scrollTop === 0 && hasMore && !loadingMore && !loading && messages.length > 0) {
      fetchMessages(true);
    }
  };

  const fetchConversations = async (userId) => {
    const { data: msgs, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, username, avatar_url),
        receiver:profiles!receiver_id(id, username, avatar_url),
        post:posts!post_id(id, pet_name, origin, destination, author_id, status)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      setLoading(false);
      return [];
    }

    const chatMap = new Map();
    msgs.forEach(m => {
      const other = m.sender_id === userId ? m.receiver : m.sender;
      if (!other) return;
      
      const key = `${other.id}-${m.post_id || 'none'}`;
      if (!chatMap.has(key)) {
        chatMap.set(key, {
          profile: other,
          post_id: m.post_id,
          postDetails: m.post,
          lastMessage: m
        });
      }
    });

    const convList = Array.from(chatMap.values());
    setConversations(convList);
    setLoading(false);
    return convList;
  };

  const fetchMessages = async (loadOlder = false) => {
    if (!selectedConv || !currentUser) {
      setLoading(false);
      return;
    }
    if (loadOlder) setLoadingMore(true);

    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedConv.profile.id}),and(sender_id.eq.${selectedConv.profile.id},receiver_id.eq.${currentUser.id})`);
    
    // For now, let's be more lenient with post_id during the transition
    if (selectedConv.post_id) {
      // If we have a post context, try to fetch messages for that post
      query = query.eq('post_id', selectedConv.post_id);
    } else {
      // If no post context (generic chat), fetch messages with NO post_id
      query = query.is('post_id', null);
    }

    // Pagination: base on the oldest known message if `loadOlder` is true
    if (loadOlder && messages.length > 0) {
      query = query.lt('created_at', messages[0].created_at);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      if (loadOlder) setLoadingMore(false);
      else setLoading(false);
      return;
    }

    // We ordered descending to get latest, so reverse to display chronologically
    const reversedData = (data || []).reverse();
    setHasMore(data.length === 30);

    if (loadOlder) {
      if (scrollRef.current) prevScrollHeightRef.current = scrollRef.current.scrollHeight;
      setMessages(prev => [...reversedData, ...prev]);
      setLoadingMore(false);
    } else {
      setMessages(reversedData);
      setLoading(false);
    }
  };

  const handleSend = async (e, forcedContent = null, attachmentUrl = null) => {
    if (e) e.preventDefault();
    const text = forcedContent || inputText;
    if (!text.trim() && !attachmentUrl) return;

    if (!selectedConv || !currentUser) return;

    setInputText('');
    setShowEmojiPicker(false);

    // Optimistic Update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: selectedConv.profile.id,
      post_id: selectedConv.post_id,
      content: text,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedConv.profile.id,
        post_id: selectedConv.post_id,
        content: text,
        attachment_url: attachmentUrl,
        message_type: attachmentUrl ? 'image' : 'text'
      });

    if (error) {
      console.error(error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInputText(text); // Restore text on error
    } else {
      // Sidebar update (will be handled by real-time soon, but good for speed)
      fetchConversations(currentUser.id);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.id}/${Date.now()}_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      // Send the image as a message
      await handleSend(null, '', publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err.message);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmFlight = async () => {
    setConfirmingFlight(false);

    // Update post
    const { error: postErr } = await supabase.from('posts').update({
      status: 'confirmed',
      assigned_user_id: selectedConv.profile.id
    }).eq('id', selectedConv.post_id);

    if (postErr) {
      console.error('Post update error:', postErr);
      return alert('Error updating post: ' + postErr.message);
    }

    // Inject system message
    const { data: newMsg, error: msgErr } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedConv.profile.id,
      post_id: selectedConv.post_id,
      content: `SYSTEM_CONFIRMED:${selectedConv.post_id}`,
      message_type: 'text'
    }).select().single();

    if (msgErr) {
      console.error('Message insert error:', msgErr);
      return alert('Error inserting system message: ' + msgErr.message);
    }

    // Manually push message into active view so it shows instantly
    if (newMsg) {
      setMessages(prev => [...prev, newMsg]);
    }

    // Update local state immediately to hide button
    setSelectedConv(prev => ({
      ...prev,
      postDetails: { ...prev.postDetails, status: 'confirmed' }
    }));
  };

  const toggleEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  if (loading) {
    return (
      <div className="container mt-4 flex-center" style={{ height: '400px' }}>
        <Loader2 className="spinner" size={32} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="container mt-4 messages-layout" style={{ maxWidth: '1000px' }}>
      {/* Sidebar: Chat List */}
      <div className={`card glass-panel messages-sidebar ${selectedConv ? 'hidden-on-mobile' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Messages</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && !selectedConv ? (
            <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No conversations yet.
            </div>
          ) : (
            <>
              {/* If we have a selected conversation that isn't in conversations list yet (new chat) */}
              {selectedConv && !conversations.find(c => c.profile.id === selectedConv.profile.id && c.post_id === selectedConv.post_id) && (
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'rgba(var(--color-primary-rgb, 38, 166, 154), 0.1)',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedConv.profile.username || 'New Chat'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {selectedConv.postDetails ? (
                        `Re: ${selectedConv.postDetails.pet_name || `${selectedConv.postDetails.origin} → ${selectedConv.postDetails.destination}`}`
                      ) : (
                        'Starting conversation…'
                      )}
                    </div>
                  </div>
                </div>
              )}

              {conversations.map(chat => {
                const isSelected = selectedConv?.profile.id === chat.profile.id && selectedConv?.post_id === chat.post_id;
                return (
                  <div
                    key={`${chat.profile.id}-${chat.post_id || 'none'}`}
                    onClick={() => setSelectedConv(chat)}
                    style={{
                      display: 'flex',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-md)',
                      backgroundColor: isSelected ? 'rgba(var(--color-primary-rgb, 38, 166, 154), 0.1)' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    className="chat-item-hover"
                  >
                    {chat.profile.avatar_url ? (
                      <img src={chat.profile.avatar_url} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--color-primary)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex-between">
                        <strong style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.profile.username || 'Anonymous'}</strong>
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                          {new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                      
                      {chat.postDetails && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '2px' }}>
                          Post: {chat.postDetails.pet_name || `${chat.postDetails.origin} → ${chat.postDetails.destination}`}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: isSelected ? 'var(--color-text-main)' : 'var(--color-text-muted)', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontWeight: (chat.lastMessage.receiver_id === currentUser.id && !chat.lastMessage.is_read) ? 700 : 400
                        }}>
                          {chat.lastMessage.sender_id === currentUser.id ? 'You: ' : ''}{chat.lastMessage.content}
                        </div>
                        {chat.lastMessage.receiver_id === currentUser.id && !chat.lastMessage.is_read && (
                          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', flexShrink: 0 }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`card glass-panel messages-main ${!selectedConv ? 'hidden-on-mobile' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button 
                  className="btn btn-ghost mobile-only" 
                  onClick={() => setSelectedConv(null)}
                  style={{ padding: '0.4rem', color: 'var(--color-text-muted)', marginRight: '0.25rem' }}
                >
                  <ArrowLeft size={20} />
                </button>
                {selectedConv.profile.avatar_url ? (
                  <img src={selectedConv.profile.avatar_url} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                ) : (
                  <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="var(--color-primary)" />
                  </div>
                )}
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>{selectedConv.profile.username || 'Anonymous'}</strong>
                  {selectedConv.postDetails && (
                    <a 
                      href={`/post/${selectedConv.post_id}`} 
                      style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Re: {selectedConv.postDetails.pet_name || `${selectedConv.postDetails.origin} → ${selectedConv.postDetails.destination}`}
                    </a>
                  )}
                </div>
              </div>
              
              {selectedConv.postDetails && selectedConv.postDetails.author_id === currentUser.id && selectedConv.postDetails.status === 'still_needed' && (
                confirmingFlight ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>Assign {selectedConv.profile.username}?</span>
                    <button onClick={handleConfirmFlight} className="btn btn-sm" style={{ background: '#10B981', color: 'white', padding: '0.4rem 0.8rem', border: 'none' }}>Yes</button>
                    <button onClick={() => setConfirmingFlight(false)} className="btn btn-sm btn-ghost" style={{ padding: '0.4rem', color: 'var(--color-text-muted)' }}><X size={16} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmingFlight(true)}
                    className="btn btn-sm" 
                    style={{ background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', padding: '0.4rem 0.8rem' }}
                  >
                    <CheckCircle size={16} /> Confirm Match
                  </button>
                )
              )}
            </div>

            {/* Message History */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{ flex: 1, padding: 'var(--spacing-lg) var(--spacing-md)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)', backgroundSize: '24px 24px' }}
            >
              {loadingMore && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
                  <Loader2 className="spinner" size={20} color="var(--color-primary)" />
                </div>
              )}
              {messages.length === 0 && !loadingMore && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                  <MessageCircle size={48} color="var(--color-primary)" />
                  <p style={{ marginTop: '1rem' }}>No messages yet. Send a message to start the conversation!</p>
                </div>
              )}
              {messages.map((msg) => {
                if (msg.content && msg.content.startsWith('SYSTEM_CONFIRMED:')) {
                  return (
                    <div key={msg.id} style={{ alignSelf: 'center', margin: '0.75rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ background: '#EFF6FF', color: '#1E3A8A', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem' }}>🤝</div>
                        <strong>Flight Party Assigned!</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.85 }}>This flight is confirmed. You can officially complete it from the Post page later.</p>
                      </div>
                    </div>
                  );
                }
                
                if (msg.content && msg.content.startsWith('SYSTEM_REVIEW_PROMPT:')) {
                  return (
                    <div key={msg.id} style={{ alignSelf: 'center', margin: '0.75rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ background: '#F0FDF4', color: '#166534', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.08)' }}>
                        <div style={{ fontSize: '1.5rem' }}>🎉</div>
                        <strong>Flight Officially Completed!</strong>
                        <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.85 }}>Thank you for coordinating through FlyMyPaws.</p>
                        <button onClick={() => setReviewTarget(selectedConv.profile)} className="btn btn-sm" style={{ background: '#166534', color: '#fff', width: '100%', marginTop: '0.25rem', padding: '0.6rem' }}>
                          Rate {selectedConv.profile.username}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                <div key={msg.id} style={{
                  alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                  maxWidth: '75%'
                }}>
                  <div style={{
                    backgroundColor: msg.sender_id === currentUser.id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: msg.sender_id === currentUser.id ? 'white' : 'var(--color-text-main)',
                    padding: '0.65rem 1rem',
                    borderRadius: msg.sender_id === currentUser.id ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '0.95rem',
                    lineHeight: '1.4'
                  }}>
                    {msg.attachment_url && (
                      <img 
                        src={msg.attachment_url} 
                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: msg.content ? '0.5rem' : 0, display: 'block' }} 
                        alt="attachment" 
                      />
                    )}
                    {msg.content}
                  </div>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', marginTop: '4px', display: 'block', textAlign: msg.sender_id === currentUser.id ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              )})}
            </div>

            {/* Message Input */}
            <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  gap: '8px',
                  boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => toggleEmoji(e)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }}>{e}</button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ padding: '0.5rem', color: showEmojiPicker ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                  >
                    <Smile size={20} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}
                  >
                    {uploading ? <Loader2 className="spinner" size={20} /> : <ImageIcon size={20} />}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>

                <input
                  type="text"
                  className="form-control"
                  placeholder={uploading ? "Uploading..." : "Type a message..."}
                  value={inputText}
                  disabled={uploading}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1, margin: 0, borderRadius: '24px', padding: '0.6rem 1.2rem', backgroundColor: 'var(--color-background)' }}
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !uploading) || uploading}
                  className="btn btn-primary"
                  style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={32} color="var(--color-primary)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--color-text-main)', margin: '0 0 0.5rem 0' }}>Your Messages</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      
      {reviewTarget && (
        <ReviewModal
          revieweeId={reviewTarget.id}
          revieweeUsername={reviewTarget.username}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

export default Messages;

