// screens/ChatRoomScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, Button, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Wing', content: 'Hello Everyone！' }
  ]);
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (!text) return;
    setMessages([...messages, { id: Date.now().toString(), sender: 'You', content: text }]);
    setText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.message}>
            <Text style={styles.sender}>{item.sender}: </Text>{item.content}
          </Text>
        )}
      />
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 10, marginBottom: 5 },
  message: { marginVertical: 4 },
  sender: { fontWeight: 'bold' }
});
