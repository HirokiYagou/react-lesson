import React, { useState, useEffect } from 'react';
import styles from './Post.module.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import firebase from 'firebase/app';
import { db } from '../firebase';

import { Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';

interface PROP {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
};
interface COMMENT {
  commentId: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
};

const Post: React.FC<PROP> = (prop) => {
  const user = useSelector(selectUser);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<COMMENT[]>([{
    commentId: '',
    avatar: '',
    text: '',
    timestamp: null,
    username: '',
  }]);
  const [openComments, setOpenComments] = useState(false);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection('posts').doc(prop.postId).collection('comments').add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    })
    setComment('');
  }

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .doc(prop.postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((ss) => {
        setComments(ss.docs.map((doc) => (
          {
            commentId: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }
        )))
      })
    return () => unSub();
  }, [prop.postId])
  
  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={prop.avatar}/>
      </div>
      <div className={styles.post_body}>
        <div className={styles.post_header}>
          <h3>
            <span className={styles.post_headerUser}>{prop.username}</span>
            <span className={styles.post_headerTime}>
              {new Date(prop.timestamp?.toDate()).toLocaleString()}
            </span>
          </h3>
        </div>
        <div className={styles.post_tweet}>
          <p>{prop.text}</p>
        </div>
        { prop.image && (
          <div className={styles.post_tweetImage}>
            <img src={prop.image} alt="tweet" />
          </div>
        )}
        <MessageIcon
          className={styles.post_commentIcon}
          onClick={()=>setOpenComments(!openComments)}
        />
        {openComments && (<>
          {comments.map((com) => (
            <div key={com.commentId} className={styles.post_comment}>
              <Avatar src={com.avatar} sx={{ width: 24, height: 24 }}/>
              <span className={styles.post_commentUser}>@{com.username}</span>
              <span className={styles.post_commentText}>{com.text}</span>
              <span className={styles.post_headerTime}>
                {new Date(com.timestamp?.toDate()).toLocaleString()}
              </span>
            </div>
          ))}
          <form onSubmit={newComment}>
            <div className={styles.post_form}>
              <input
                className={styles.post_input}
                type="text"
                placeholder="Type new comment..."
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setComment(e.target.value)}}
              />
              <button
                className={comment ? styles.post_button : styles.post_buttonDisable}
                disabled={!comment}
                type="submit"
              >
                <SendIcon className={styles.sendIcon}/>
              </button>
            </div>
          </form>
        </>)}
      </div>
    </div>
  )
}

export default Post;