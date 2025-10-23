import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import finagroLogo from '../assets/finagro_logo.png';

type FieldCategory = {
  id: number;
  naziv: string;
};


export default function HomeScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const [data, setData] = useState<FieldCategory[]>([]);
  const loadData = async () => {
    const result = await database.getAllAsync<FieldCategory>("SELECT * FROM kategorije_njiva;");
    setData(result);
  }

  useFocusEffect(
    useCallback( () => {
        loadData();
    }, [])
    );

  const handleCardPress = (categoryId: number, categoryName: string) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: categoryId, name: categoryName }
    });
  };

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
      edges={['top', 'left', 'right']}
    >
      {/* Top bar */}
      <View className={`bg-green-800 border-b border-white ${isLandscape ? 'px-6 py-2.0' : 'px-4 py-2.5'}`}>
        <View className="flex-row items-center justify-between self-center w-full max-w-screen-lg">
          {/* Leva strana - Ikonica i Ime */}
          <View className="flex-row items-center flex-1">
            {/* Ikonica */}
            <View
              className={`items-center justify-center rounded-full mr-6 bg-white ${
                isLandscape ? 'w-[42px] h-[32px]' : 'w-12 h-12'
              }`}
            >
            <Image
              source={require('../assets/finagro_logo.png')}
              style={{
                width: 100,
                height: 40,
                resizeMode: 'contain',
              }}
            />
            </View>

            {/* Ime i prezime */}
            <View className="flex-1">
              <Text className={`font-semibold text-white ${isLandscape ? 'text-xl' : 'text-lg'}`}>
                Knjiga Polja
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => console.log("Dodaj novo")}
            className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
          {/* Desna strana - Datum */}
          <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
            <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>
              {dateString}
            </Text>
          </View>

        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1 bg-gray-800"
        contentContainerClassName={isLandscape ? 'p-6 pt-8' : 'p-4 pt-6'}
      >
        {/* Grid kartice */}
        {data.length === 0 ? (
          <View className="items-center justify-center p-8">
            <Text className="text-gray-500 text-base">Prazna baza podataka</Text>
          </View>
        ) : (
          <View className={`flex-row flex-wrap justify-center ${isLandscape ? 'gap-6' : 'gap-4'}`}>
            {data.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => handleCardPress(card.id, card.naziv)}
                activeOpacity={0.7}
              >
                <View
                  className={`rounded-2xl overflow-hidden shadow-md shadow-black/10 bg-white border border-black ${isLandscape ? 'w-[200px]' : 'w-[180px]'}`}
                >
                  {/* Gornji deo - Slika */}
                  <View className={`items-center justify-center bg-green-800 ${isLandscape ? 'h-[173px]' : 'h-[126px]'}`}>
                    <Text className={isLandscape ? 'text-[56px]' : 'text-5xl'}>🌾</Text>
                  </View>

                  {/* Donji deo - Ime */}
                  <View className="p-4 border-t border-black">
                    <Text className={`text-center font-semibold text-black ${isLandscape ? 'text-2xl' : 'text-[25px]'}`}>
                      {card.naziv}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Prazan prostor na dnu */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}