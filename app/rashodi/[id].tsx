import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MagacinButton from '../../components/magacin-button';

interface Operacija {
  id: number;
    datum: string | null;
    vrsta: string;
    potrosnja: number | null;
    kolicina: number | null;
    cena: number | null;
    njiva_id: number;
    velicina?: number | null;
}

interface RashodItem {
  id: number;
  datum: string | null;
  vrsta: string;
  rashodGoriva: number;
  rashodMaterijala: number;
  ukupanRashod: number;
}

export default function RashodiScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { id, name, slika, category } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [rashodi, setRashodi] = useState<RashodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ukupnoRashode, setUkupnoRashode] = useState(0);

  useEffect(() => {
    loadRashodi();
  }, [id]);

  const loadRashodi = async () => {
    try {
      const operacije = await database.getAllAsync<Operacija>(
        'SELECT o.*, n.velicina as velicina FROM operacije_njive o JOIN njive n ON o.njiva_id = n.id WHERE o.njiva_id = ? ORDER BY o.id DESC',
        [Number(id)]
      );

      const rashodiList: RashodItem[] = operacije.map((op) => {
        const rashodGoriva = (op.potrosnja || 0) * 120; // CENA GORIVA
        const velicina = op.velicina ?? 1;
        const rashodMaterijala = (op.kolicina || 0) * (op.cena || 0) * velicina;
        const ukupanRashod = rashodGoriva + rashodMaterijala; 

        return {
          id: op.id,
          datum: op.datum,
          vrsta: op.vrsta,
          rashodGoriva,
          rashodMaterijala,
          ukupanRashod,
        };
      });

      setRashodi(rashodiList);
      const total = rashodiList.reduce((sum, r) => sum + r.ukupanRashod, 0);
      setUkupnoRashode(total);
    } catch (error) {
      console.error('Error loading rashodi:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={['top', 'left', 'right']}>
      {/* Page-specific status bar to match the red navbar on this screen */}
      <StatusBar backgroundColor="#b91c1c" style="light" />
      <View className={`bg-red-700 border-b border-white ${isLandscape ? 'px-6 py-2.5' : 'px-4 py-2.5'}`}>
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
                Rashodi - {name}
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
        {rashodi.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-gray-700 rounded-full p-8 mb-6">
              <MaterialCommunityIcons name="cash-remove" size={80} color="#9ca3af" />
            </View>
            <Text className="text-gray-400 text-center text-lg font-semibold">Nema rashoda</Text>
            <Text className="text-gray-500 text-center mt-2 px-6">Nema operacija na ovoj njivu</Text>
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={rashodi}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View className="h-3" />}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View className="bg-gradient-to-b from-gray-700 to-gray-600 rounded-2xl p-5 border-2 border-gray-500 shadow-lg shadow-black/30">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white font-semibold text-lg">{item.vrsta}</Text>
                        <Text className="text-gray-300 text-sm">{item.datum || dateString}</Text>
                      </View>
                      <View className="space-y-1">
                        <View className="flex-row justify-between">
                          <Text className="text-gray-300 text-sm">Gorivo:</Text>
                          <Text className="text-yellow-300 font-semibold">{item.rashodGoriva.toFixed(2)} din</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-300 text-sm">Materijal:</Text>
                          <Text className="text-yellow-300 font-semibold">{item.rashodMaterijala.toFixed(2)} din</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View className="pt-3 border-t border-gray-500">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white font-bold text-base">Ukupno:</Text>
                      <Text className="text-red-600 font-bold text-xl">{item.ukupanRashod.toFixed(2)} din</Text>
                    </View>
                  </View>
                </View>
              )}
              ListFooterComponent={() => (
                <View className="mt-6 bg-gradient-to-b from-red-700 to-red-800 rounded-2xl p-6 border-2 border-red-600 shadow-lg shadow-black/40">
                  <Text className="text-white font-bold text-center text-lg mb-2">Ukupni rashodi na njivu</Text>
                  <Text className="text-orange-300 font-bold text-center text-4xl">{ukupnoRashode.toFixed(2)} дин</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
