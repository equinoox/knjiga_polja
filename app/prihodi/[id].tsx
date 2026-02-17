import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MagacinButton from '../../components/magacin-button';

interface Prihod {
  id: number;
  datum: string;
  izvor: string | null;
  iznos: number | null;
  njiva_id: number;
}

export default function PrihodiScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { id, name, slika, category } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [prihodi, setPrihodi] = useState<Prihod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [ukupnoPrihodi, setUkupnoPrihodi] = useState(0);

  const [datum, setDatum] = useState('');
  const [izvor, setIzvor] = useState('');
  const [iznos, setIznos] = useState('');

  useEffect(() => {
    loadPrihodi();
  }, [id]);

  const loadPrihodi = async () => {
    try {
      const result = await database.getAllAsync<Prihod>(
        'SELECT * FROM prihodi_njive WHERE njiva_id = ? ORDER BY id DESC',
        [Number(id)]
      );
      setPrihodi(result);
      const total = result.reduce((sum, p) => sum + (p.iznos ?? 0), 0);
      setUkupnoPrihodi(total);
    } catch (error) {
      console.error('Error loading prihodi:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    setDatum(`${dd}.${mm}.${yyyy}`);
    setIzvor('');
    setIznos('');
    setModalVisible(true);
  };

  const handleDodaj = async () => {
    if (!datum) return;
    try {
      await database.runAsync(
        'INSERT INTO prihodi_njive (datum, izvor, iznos, njiva_id) VALUES (?, ?, ?, ?)',
        [datum, izvor || null, Number(iznos) || 0, Number(id)]
      );
      await loadPrihodi();
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding prihod:', error);
    }
  };

  const handleDelete = async (prihodId: number) => {
    Alert.alert(
      'Potvrda',
      'Da li želiš izbrisati ovaj prihod?',
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.runAsync('DELETE FROM prihodi_njive WHERE id = ?', [prihodId]);
              await loadPrihodi();
            } catch (error) {
              console.error('Error deleting prihod:', error);
            }
          },
        },
      ]
    );
  };

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
      <View className={`bg-green-800 border-b border-white ${isLandscape ? 'px-6 py-2.5' : 'px-4 py-2.5'}`}>
        <View className="flex-row items-center justify-between self-center w-full max-w-screen-lg">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`items-center justify-center rounded-full mr-3.5 bg-white ${isLandscape ? 'w-[42px] h-[32px]' : 'w-12 h-12'}`}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className={`font-semibold text-white ${isLandscape ? 'text-2xl' : 'text-lg'}`}>
                Prihodi - {name}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <MagacinButton isLandscape={isLandscape} />
            <TouchableOpacity
              onPress={() => router.push('/pripadnosti')}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`}
              activeOpacity={0.7}
            >
              <Ionicons name="stats-chart" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openModal} className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`} activeOpacity={0.7}>
              <Ionicons name="add" size={26} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log('Settings')}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="black" />
            </TouchableOpacity>
            <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
              <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>{dateString}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1 bg-gray-800 p-6">

        {prihodi.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-gray-700 rounded-full p-8 mb-6">
              <MaterialCommunityIcons name="finance" size={80} color="#9ca3af" />
            </View>
            <Text className="text-gray-400 text-center text-lg font-semibold">Nema prihoda</Text>
            <Text className="text-gray-500 text-center mt-2 px-6">Kliknite + za dodavanje prihoda</Text>
          </View>
        ) : (
          <FlatList
            data={prihodi}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View className="bg-gradient-to-b from-gray-700 to-gray-600 rounded-2xl p-5 border-2 border-gray-500 shadow-lg shadow-black/30">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-green-600 rounded-full p-2.5 mr-4">
                      <MaterialCommunityIcons name="currency-usd" size={24} color="white" />
                    </View>
                    <Text className="text-white font-bold text-xl flex-1">{item.izvor || 'Prihod'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-red-600 rounded-full p-2 active:bg-red-700">
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="bg-black/30 rounded-xl p-3 flex-row items-center">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-gray-300 ml-3 text-sm">Datum:</Text>
                    <Text className="text-white font-bold text-lg ml-2">{item.datum}</Text>
                  </View>
                  <View className="flex-row items-center ml-auto">
                    <Text className="text-gray-300 text-sm">Iznos:</Text>
                    <Text className="text-green-500 font-bold text-lg ml-2">{(item.iznos ?? 0).toFixed(2)} RSD</Text>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={() => (
              <View className="mt-6 bg-gradient-to-b from-green-700 to-green-800 rounded-2xl p-6 border-2 border-green-600 shadow-lg shadow-black/40">
                <Text className="text-white font-bold text-center text-lg mb-2">Ukupni prihodi za njivu</Text>
                <Text className="text-green-300 font-bold text-center text-4xl">{ukupnoPrihodi.toFixed(2)} RSD</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Add prihod modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-gray-800 rounded-2xl w-full max-w-md border-2 border-gray-600">
            <View className="bg-green-600 px-5 py-4 flex-row items-center justify-between rounded-t-2xl">
              <Text className="text-white font-bold text-xl">Dodaj prihod</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">DATUM</Text>
                <TextInput value={datum} onChangeText={setDatum} placeholder="dd.mm.yyyy" placeholderTextColor="#9ca3af" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">IZVOR</Text>
                <TextInput value={izvor} onChangeText={setIzvor} placeholder="npr. Prodaja pšenice" placeholderTextColor="#9ca3af" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">IZNOS (RSD)</Text>
                <TextInput value={iznos} onChangeText={setIznos} placeholder="npr. 2500.00" placeholderTextColor="#9ca3af" keyboardType="numeric" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
              </View>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-gray-600 rounded-lg py-3 items-center"><Text className="text-white font-semibold">Otkaži</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleDodaj} className="flex-1 bg-green-600 rounded-lg py-3 items-center"><Text className="text-white font-semibold">Sačuvaj</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
