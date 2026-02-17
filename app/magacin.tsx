import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Hemija {
  id: number;
  naziv: string;
  kolicina_litara: number;
  cena_po_litri: number;
}

export default function MagacinScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [hemije, setHemije] = useState<Hemija[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaHemijaNaziv, setNovaHemijaNaziv] = useState('');
  const [novaHemijaKolicina, setNovaHemijaKolicina] = useState('');
  const [novaHemijaCena, setNovaHemijaCena] = useState('');
  // Add-litre modal state
  const [dodajKolicinaModalVisible, setDodajKolicinaModalVisible] = useState(false);
  const [hemijaZaDodavanje, setHemijaZaDodavanje] = useState<Hemija | null>(null);
  const [dodajKolicinaValue, setDodajKolicinaValue] = useState('');

  const loadHemije = async () => {
    try {
      const result = await database.getAllAsync<Hemija>(`SELECT * FROM hemije ORDER BY naziv ASC`);
      setHemije(result);
    } catch (error) {
      console.error('Error loading hemije:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHemije();
    }, [])
  );

  // Note: add-hemija UI has been removed; creation is now handled elsewhere (or via DB tools)
  const handleDodaj = async () => {
    if (!novaHemijaNaziv.trim()) return;
    try {
      await database.runAsync('INSERT INTO hemije (naziv, kolicina_litara, cena_po_litri) VALUES (?, ?, ?)', [novaHemijaNaziv.trim(), Number(novaHemijaKolicina) || 0, Number(novaHemijaCena) || 0]);
      setNovaHemijaNaziv('');
      setNovaHemijaKolicina('');
      setNovaHemijaCena('');
      setModalVisible(false);
      await loadHemije();
    } catch (error) {
      console.error('Error adding hemija:', error);
    }
  };
  const handleObrisi = async (id: number) => {
    const hemija = hemije.find(h => h.id === id);
    Alert.alert(
      'Potvrda',
      `Da li želiš izbrisati hemiju ${hemija?.naziv || ''}?`,
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.runAsync('DELETE FROM hemije WHERE id = ?', [id]);
              await loadHemije();
            } catch (error) {
              console.error('Error deleting hemija:', error);
            }
          },
        },
      ]
    );
  };

  const openDodajModal = (hemija: Hemija) => {
    setHemijaZaDodavanje(hemija);
    setDodajKolicinaValue('');
    setDodajKolicinaModalVisible(true);
  };

  const handleDodajKolicinu = async () => {
    if (!hemijaZaDodavanje) return;
    const add = Number(dodajKolicinaValue) || 0;
    if (add <= 0) return;

    try {
      await database.runAsync(
        'UPDATE hemije SET kolicina_litara = kolicina_litara + ? WHERE id = ?',
        [add, hemijaZaDodavanje.id]
      );
      await loadHemije();
      setDodajKolicinaModalVisible(false);
      setHemijaZaDodavanje(null);
      setDodajKolicinaValue('');
    } catch (error) {
      console.error('Error adding liters to hemija:', error);
    }
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Potvrda',
      'Da li želiš da štampaš informacije o magacinu?',
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da',
          onPress: async () => {
            try {
              let ukupnaVrednost = 0;
              const redovi = hemije.map((h) => {
                const vrednost = h.kolicina_litara * h.cena_po_litri;
                ukupnaVrednost += vrednost;
                return `
                  <tr>
                    <td>${h.naziv}</td>
                    <td style="text-align:right">${h.kolicina_litara.toFixed(2)} L</td>
                    <td style="text-align:right">${h.cena_po_litri.toFixed(2)} RSD</td>
                    <td style="text-align:right">${vrednost.toFixed(2)} RSD</td>
                  </tr>`;
              }).join('');

              const html = `
                <html>
                  <head>
                    <meta charset="utf-8" />
                    <style>
                      body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                      h1 { color: #166534; border-bottom: 3px solid #166534; padding-bottom: 10px; }
                      h3 { color: #666; font-weight: normal; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      th { background-color: #166534; color: white; padding: 12px 8px; text-align: left; }
                      th:not(:first-child) { text-align: right; }
                      td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
                      tr:nth-child(even) { background-color: #f9f9f9; }
                      .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #166534; display: flex; justify-content: flex-end; }
                      .footer strong { font-size: 18px; color: #166534; }
                    </style>
                  </head>
                  <body>
                    <h3>Datum: ${dateString}</h3>
                    <h1>Magacin Hemija</h1>
                    <table>
                      <thead>
                        <tr>
                          <th>Naziv</th>
                          <th>Količina</th>
                          <th>Cena po litruW</th>
                          <th>Ukupna vrednost</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${redovi}
                      </tbody>
                    </table>
                    <div class="footer">
                      <strong>Ukupna vrednost magacina: ${ukupnaVrednost.toFixed(2)} RSD</strong>
                    </div>
                  </body>
                </html>
              `;

              const { uri } = await Print.printToFileAsync({ html } as any);
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Odštampaj magacin PDF',
                UTI: 'com.adobe.pdf',
              });
            } catch (error) {
              console.error('Error exporting PDF:', error);
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
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Top bar */}
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
                Magacin Hemija
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push('/pripadnosti')}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`}
              activeOpacity={0.7}
            >
              <Ionicons name="stats-chart" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExportPDF}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="black" />
            </TouchableOpacity>
            <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
              <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>
                {dateString}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content Area: only list of hemije (add UI removed) */}
      <View className="flex-1 bg-gray-800 p-6">
        {hemije.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-gray-700 rounded-full p-8 mb-6">
              <MaterialCommunityIcons name="flask-empty-outline" size={80} color="#9ca3af" />
            </View>
            <Text className="text-gray-400 text-center text-lg font-semibold">Magacin je prazan</Text>
            <Text className="text-gray-500 text-center mt-2 px-6">Kliknite + za dodavanje Hemije</Text>
          </View>
        ) : (
          <FlatList
            data={hemije}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View className="bg-gradient-to-b from-gray-700 to-gray-600 rounded-2xl p-5 border-2 border-gray-500 shadow-lg shadow-black/30">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-amber-600 rounded-full p-2.5 mr-4">
                      <MaterialCommunityIcons name="beaker" size={24} color="white" />
                    </View>
                    <Text className="text-white font-bold text-xl flex-1">{item.naziv}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => openDodajModal(item)}
                      className="bg-green-600 rounded-full p-2 mr-2 active:bg-green-700"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleObrisi(item.id)}
                      className="bg-red-600 rounded-full p-2 active:bg-red-700"
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="bg-black/30 rounded-xl p-3 flex-row items-center mb-2">
                  <MaterialCommunityIcons name="water" size={20} color="#22c55e" />
                  <Text className="text-gray-300 ml-3 text-sm">Količina na stanju:</Text>
                  <Text className="text-green-400 font-bold text-lg ml-auto">{item.kolicina_litara.toFixed(2)} L</Text>
                </View>

                <View className="bg-black/30 rounded-xl p-3 flex-row items-center">
                  <MaterialCommunityIcons name="cash" size={20} color="#facc15" />
                  <Text className="text-gray-300 ml-3 text-sm">Cena po litru:</Text>
                  <Text className="text-yellow-400 font-bold text-lg ml-auto">{item.cena_po_litri.toFixed(2)} RSD</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Add hemija modal (opened from + in header) */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-gray-800 rounded-2xl w-full max-w-md border-2 border-gray-600">
            <View className="bg-amber-600 px-5 py-4 flex-row items-center justify-between rounded-t-2xl">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
                <Text className="text-white font-bold text-xl ml-2">Dodaj hemiju</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">NAZIV HEMIJE</Text>
                <TextInput
                  value={novaHemijaNaziv}
                  onChangeText={setNovaHemijaNaziv}
                  placeholder="npr. Gliphosat"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">KOLIČINA (LITARA)</Text>
                <TextInput
                  value={novaHemijaKolicina}
                  onChangeText={setNovaHemijaKolicina}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">CENA PO LITRU (RSD)</Text>
                <TextInput
                  value={novaHemijaCena}
                  onChangeText={setNovaHemijaCena}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </View>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-gray-600 rounded-lg py-3 items-center">
                  <Text className="text-white font-semibold">Otkaži</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDodaj} className="flex-1 bg-green-600 rounded-lg py-3 items-center">
                  <Text className="text-white font-semibold">Sačuvaj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dodaj kolicinu modal */}
      <Modal animationType="fade" transparent={true} visible={dodajKolicinaModalVisible} onRequestClose={() => setDodajKolicinaModalVisible(false)}>
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-gray-800 rounded-2xl w-full max-w-md border-2 border-gray-600">
            <View className="bg-green-800 px-5 py-4 flex-row items-center justify-between rounded-t-2xl">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="beaker" size={24} color="white" />
                <Text className="text-white font-bold text-xl ml-2">Dodaj količinu</Text>
              </View>
              <TouchableOpacity onPress={() => setDodajKolicinaModalVisible(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">HEMIJA</Text>
                <Text className="text-white font-medium">{hemijaZaDodavanje ? hemijaZaDodavanje.naziv : ''}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">NA STANJU</Text>
                <Text className="text-white font-medium">{hemijaZaDodavanje ? hemijaZaDodavanje.kolicina_litara.toFixed(2) + ' L' : ''}</Text>
              </View>

              <View className="mb-4">
                <Text className="text-gray-300 text-sm font-semibold mb-2">DODAJ (LITARA)</Text>
                <TextInput
                  value={dodajKolicinaValue}
                  onChangeText={setDodajKolicinaValue}
                  placeholder="npr. 150.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </View>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity onPress={() => setDodajKolicinaModalVisible(false)} className="flex-1 bg-gray-600 rounded-lg py-3 items-center">
                  <Text className="text-white font-semibold">Otkaži</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDodajKolicinu} className="flex-1 bg-green-600 rounded-lg py-3 items-center">
                  <Text className="text-white font-semibold">Dodaj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
