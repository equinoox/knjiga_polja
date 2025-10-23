import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Field = {
  id: number;
  naziv: string;
  opis: string;
  slika: string;
  kategorija_id: number;
};

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [data, setData] = useState<Field[]>([]);

  const loadData = async () => {
    const result = await database.getAllAsync<Field>(
      "SELECT * FROM njive WHERE kategorija_id = ?;",
      [Number([id])]
    );
    setData(result);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

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
        {/* Leva strana - Back button i Ime */}
        <View className="flex-row items-center flex-1">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className={`items-center justify-center rounded-full mr-3.5 bg-white ${isLandscape ? 'w-[42px] h-[32px]' : 'w-12 h-12'}`}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Ime kategorije */}
          <View className="flex-1">
            <Text className={`font-semibold text-white ${isLandscape ? 'text-2xl' : 'text-lg'}`}>
              {name}
            </Text>
          </View>
        </View>

        {/* Desna strana - Dugmad i Datum */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => console.log("Dodaj novo")}
            className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
          {/* Datum */}
          <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
            <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>
              {dateString}
            </Text>
          </View>
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
            <Text className="text-gray-500 text-base">Nema njiva u ovoj kategoriji</Text>
          </View>
        ) : (
          <View className={`flex-row flex-wrap justify-center ${isLandscape ? 'gap-5' : 'gap-4'}`}>
            {data.map((field: Field) => (
              <View
                key={field.id}
                className={`rounded-2xl overflow-hidden shadow-lg shadow-black/50 bg-white border border-black ${isLandscape ? 'w-[200px]' : 'w-[180px]'}`}
              >
                {/* Gornji deo - Slika */}
                <View className={`items-center justify-center bg-green-800 ${isLandscape ? 'h-[173px]' : 'h-[126px]'}`}>
                <Image
                  source={require('../../assets/farma/brdo_donji_deo.png')} // field.slika
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
                </View>

                {/* Donji deo - Ime i opis */}
                <View className="p-4 border-t border-amber-200 bg-white">
                  <Text
                    className={`text-center font-semibold text-black ${isLandscape ? 'text-2xl' : 'text-[25px]'}}`}
                    numberOfLines={1}
                  >
                    {field.naziv}
                  </Text>
                  {field.opis ? (
                    <Text
                      className={`text-center text-gray-600 ${isLandscape ? 'text-[13px]' : 'text-[12px]'} mt-1`}
                      numberOfLines={2}
                    >
                      {field.opis}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
        {/* Prazan prostor na dnu */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}