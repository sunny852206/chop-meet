import {
  View, Text, TextInput, Pressable, FlatList, Image,
} from 'react-native';
import { useEffect, useState } from 'react';
import { ref, onValue, push, set, get, update } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { db, storage } from '../firebase';
import * as ImagePicker from 'react-native-image-picker';
import EmojiSelector from 'react-native-emoji-selector';
import auth from '@react-native-firebase/auth';

export default function ChatRoomScreen({ route }) {
  const { mealId } = route.params;
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    const uid = auth().currentUser.uid;
    setUserId(uid);
    get(ref(db, `users/${uid}`)).then(snapshot => {
      if (snapshot.exists()) setDisplayName(snapshot.val().name);
    });
  }, []);

  useEffect(() => {
    const msgRef = ref(db, `messages/${mealId}`);
    onValue(msgRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const messageKeys = Object.keys(data);
        const messageArray = Object.values(data);
        setMessages(messageArray);

        const updates = {};
        messageArray.forEach((msg, index) => {
          if (!msg.readBy?.includes(userId)) {
            const msgKey = messageKeys[index];
            updates[`messages/${mealId}/${msgKey}/readBy`] = [...(msg.readBy || []), userId];
          }
        });
        if (Object.keys(updates).length > 0) {
          update(ref(db), updates);
        }
      } else {
        setMessages([]);
      }
    });
  }, [mealId, userId]);

  const handleSend = async (msg) => {
    const newMsg = {
      sender: userId,
      senderName: displayName,
      message: msg,
      timestamp: new Date().toISOString(),
      readBy: [userId],
    };
    const newRef = push(ref(db, `messages/${mealId}`));
    await set(newRef, newMsg);
    setInput('');
  };

  const sendImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (res) => {
      if (res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const imgRef = storageRef(storage, `chatImages/${mealId}/${Date.now()}.jpg`);
        const blob = await fetch(asset.uri).then(r => r.blob());
        await uploadBytes(imgRef, blob);
        const url = await getDownloadURL(imgRef);
        const newMsg = {
          sender: userId,
          senderName: displayName,
          imageUrl: url,
          timestamp: new Date().toISOString(),
          readBy: [userId],
        };
        const newRef = push(ref(db, `messages/${mealId}`));
        await set(newRef, newMsg);
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={{ margin: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.senderName}</Text>
            {item.message && <Text>{item.message}</Text>}
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={{ width: 200, height: 200 }} />
            )}
            <Text style={{ fontSize: 12, color: '#888' }}>
              👁 Seen by {item.readBy?.length || 0}
            </Text>
          </View>
        )}
      />

      {showEmoji && (
        <EmojiSelector
          onEmojiSelected={(emoji) => {
            setInput((prev) => prev + emoji);
            setShowEmoji(false);
          }}
          showSearchBar={false}
        />
      )}

      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
        />
        <Pressable onPress={() => handleSend(input)}><Text>Send</Text></Pressable>
        <Pressable onPress={() => setShowEmoji(true)}><Text>😊</Text></Pressable>
        <Pressable onPress={sendImage}><Text>🖼️</Text></Pressable>
      </View>
    </View>
  );
}
