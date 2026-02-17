import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MagacinButton from '../components/magacin-button';

const PRIPADNOSTI_OPTIONS = ['KLAS', 'Finagro', 'Nikola', 'Dusan', 'Savo'];

export default function PripadnostiScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [selectedPripadnost, setSelectedPripadnost] = useState<string>(PRIPADNOSTI_OPTIONS[0]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [ukupnoPrihodi, setUkupnoPrihodi] = useState(0);
  const [ukupnoRashodi, setUkupnoRashodi] = useState(0);
  const [brojNjiva, setBrojNjiva] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedPripadnost]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get count of njive with this pripadnost
      const countResult = await database.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM njive WHERE TRIM(LOWER(pripadnost)) = LOWER(TRIM(?))`,
        [selectedPripadnost]
      );
      setBrojNjiva(countResult[0]?.count ?? 0);

      // Get total prihodi for this pripadnost
      const prihodiResult = await database.getAllAsync<{ total: number }>(
        `SELECT COALESCE(SUM(pr.iznos), 0) as total 
         FROM prihodi_njive pr 
         JOIN njive n ON pr.njiva_id = n.id 
         WHERE TRIM(LOWER(n.pripadnost)) = LOWER(TRIM(?))`,
        [selectedPripadnost]
      );
      setUkupnoPrihodi(prihodiResult[0]?.total ?? 0);

      // Get total rashodi for this pripadnost (gorivo + materijal)
      const rashodiResult = await database.getAllAsync<{ total: number }>(
        `SELECT COALESCE(SUM((COALESCE(o.potrosnja, 0) * 120) + (COALESCE(o.kolicina, 0) * COALESCE(o.cena, 0) * COALESCE(n.velicina, 1))), 0) as total
         FROM operacije_njive o
         JOIN njive n ON o.njiva_id = n.id
         WHERE TRIM(LOWER(n.pripadnost)) = LOWER(TRIM(?))`,
        [selectedPripadnost]
      );
      setUkupnoRashodi(rashodiResult[0]?.total ?? 0);
    } catch (error) {
      console.error('Error loading pripadnost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  const bilans = ukupnoPrihodi - ukupnoRashodi;

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
                Prihodi i Rashodi
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <MagacinButton isLandscape={isLandscape} />
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
        {/* Picker/Dropdown za pripadnost */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-2 ml-1">Izaberi pripadnost:</Text>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            className="bg-gray-700 border-2 border-gray-500 rounded-xl p-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="domain" size={24} color="#a855f7" />
              <Text className="text-white font-bold text-lg ml-3">{selectedPripadnost}</Text>
            </View>
            <Ionicons name="chevron-down" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">Učitavanje...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Info o broju njiva */}


            {/* Ukupni Prihodi */}
            <View className="bg-green-900/40 border-2 border-green-600 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-600 rounded-full p-3">
                  <Ionicons name="trending-up" size={32} color="white" />
                </View>
                <Text className="text-green-300 text-xl font-semibold ml-8">UKUPNI PRIHODI</Text>
              </View>
              <Text className="text-green-400 font-bold text-4xl text-center mt-2">
                {ukupnoPrihodi.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
              </Text>
            </View>

            {/* Ukupni Rashodi */}
            <View className="bg-red-900/40 border-2 border-red-600 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="bg-red-600 rounded-full p-3">
                  <Ionicons name="trending-down" size={32} color="white" />
                </View>
                <Text className="text-red-300 text-xl font-semibold ml-4">UKUPNI RASHODI</Text>
              </View>
              <Text className="text-red-400 font-bold text-4xl text-center mt-2">
                {ukupnoRashodi.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
              </Text>
            </View>

            {/* Bilans */}
            <View className="border-2 rounded-2xl p-6 bg-blue-900/60 border-blue-700">
              <View className="flex-row items-center mb-3">
                <View className={`rounded-full p-3 ${bilans >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <MaterialCommunityIcons name="calculator" size={32} color="white" />
                </View>
                <Text className={`text-xl font-semibold ml-4 ${bilans >= 0 ? 'text-green-300' : 'text-red-300'}`}>BILANS</Text>
              </View>
              <Text className={`font-bold text-4xl text-center mt-2 ${bilans >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {bilans >= 0 ? '+' : ''}{bilans.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/60 items-center justify-center"
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View className="bg-gray-800 rounded-2xl p-4 w-[80%] max-w-[350px] border-2 border-gray-600">
            <Text className="text-white font-bold text-xl text-center mb-4">Izaberi pripadnost</Text>
            {PRIPADNOSTI_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedPripadnost(option);
                  setPickerVisible(false);
                }}
                className={`p-4 rounded-xl mb-2 flex-row items-center ${selectedPripadnost === option ? 'bg-purple-600' : 'bg-gray-700'}`}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="domain" size={24} color={selectedPripadnost === option ? 'white' : '#a855f7'} />
                <Text className={`ml-3 font-semibold text-lg ${selectedPripadnost === option ? 'text-white' : 'text-gray-300'}`}>
                  {option}
                </Text>
                {selectedPripadnost === option && (
                  <Ionicons name="checkmark-circle" size={24} color="white" className="ml-auto" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setPickerVisible(false)}
              className="bg-gray-600 p-3 rounded-xl mt-2"
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">Zatvori</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
