import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from '../firebase';
import storage from '@react-native-firebase/storage';
import { ref as dbRef, get, set } from 'firebase/database';
import { db } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/types';


export default function ProfileScreen() {
  type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<ProfileNavProp>();
  const user = auth.currentUser;
  if (!user) return null;
  const [userData, setUserData] = useState<{ photoURL?: string; displayName?: string } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const snapshot = await get(dbRef(db, `users/${user.uid}`));
      setUserData(snapshot.val());
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        setImageUploading(true);
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = storage().ref(`profile-pics/${user.uid}.jpg`);
        await storageRef.put(blob);
        const url = await storageRef.getDownloadURL();

        
        setUserData((prev) => ({ ...prev, photoURL: url }));

        await set(dbRef(db, `users/${user.uid}/photoURL`), url);

      } catch (err) {
        console.error('Image upload failed', err);
      } finally {
        setImageUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>

      {userData?.photoURL ? (
        <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar} />
      )}

      <TouchableOpacity onPress={handleImageUpload}>
        <Text style={styles.link}>Change Profile Picture</Text>
      </TouchableOpacity>

      {imageUploading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <Text style={styles.info}>👤 {userData?.displayName || user.displayName}</Text>
      <Text style={styles.info}>📧 {user.email}</Text>

      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 16, marginTop: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  link: {
    color: '#007aff',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
});
