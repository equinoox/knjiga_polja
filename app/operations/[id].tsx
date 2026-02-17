import { AntDesign, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { njiveImages } from '../../assets/njive';
import MagacinButton from '../../components/magacin-button';

interface Operation {
  id: number;
  datum: string | null;
  vrsta: string;
  traktor: string | null;
  prik_masina: string | null;
  potrosnja: number;
  radnik: string | null;
  kolicina: number;
  cena: number;
  opis: string | null;
  hemija_id: number | null;
  njiva_id: number;
}

interface Hemija {
  id: number;
  naziv: string;
  kolicina_litara: number;
  cena_po_litri: number;
}

interface Njiva {
  id: number;
  naziv: string;
  velicina: number;
}

export default function FieldOperationsScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { category, id, name, slika } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [modalVisible, setModalVisible] = useState(false);
  const [vrsta, setVrsta] = useState('');
  const [datum, setDatum] = useState('');
  const [traktor, setTraktor] = useState('');
  const [prikMasina, setPrikMasina] = useState('');
  const [potrosnja, setPotrosnja] = useState('');
  const [opis, setOpis] = useState('');
  const [radnik, setRadnik] = useState('');
  const [kolicina, setKolicina] = useState('');
  const [cena, setCena] = useState('');
  const [showVrstaDropdown, setShowVrstaDropdown] = useState(false);
  const [showTraktorDropdown, setShowTraktorDropdown] = useState(false);
  const [showPrikMasinaDropdown, setShowPrikMasinaDropdown] = useState(false);
  const [operacije, setOperacije] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());

  // Magacin state
  const [magacinModalVisible, setMagacinModalVisible] = useState(false);
  const [hemije, setHemije] = useState<Hemija[]>([]);
  const [novaHemijaNaziv, setNovaHemijaNaziv] = useState('');
  const [novaHemijaKolicina, setNovaHemijaKolicina] = useState('');
  const [showDodajHemiju, setShowDodajHemiju] = useState(false);

  // Prskanje state
  const [selectedHemijaId, setSelectedHemijaId] = useState<number | null>(null);
  const [showHemijaDropdown, setShowHemijaDropdown] = useState(false);
  const [njivaVelicina, setNjivaVelicina] = useState<number>(0);

  const vrsteOperacija = ['Oranje', 'Podrivanje', 'Tanjiranje', 'Setvospremanje', 'Đubrivo *', 'Setva *', 'Prskanje *', 'Žetva'];
  const traktori: string[] = ['John Deere 155', 'John Deere 200', 'Claas Areon 430', 'Valtra G 125'];
  const prikMasineOranje: string[] = ['Kvernneland']
  const prikMasinePodrivanje: string[] = ['Podrivač']
  const prikMasineTanjiranje: string[] = ['Tanjirača Stara', 'Tanjirača Nova']
  const prikMasineSetvospremanje: string[] = ['Setvospremač']
  const prikMasineDjubrivo: string[] = ['Rasipač']
  const prikMasineSetva: string[] = ['Gaspardo (Žitna)', 'Kuhn (Žitna)', 'Amazone (Kukuruzna)', 'Monosem (Kukuruzna)']
  const prikMasinePrskanje: string[] = ['Jactto Prskalica']
  const prikMasineZetva: string[] = ['Adapter (Žitni)', 'Adapter (Kukuruzni)']


  const getPrikMasineZaVrstu = (): string[] => {
    switch (vrsta) {
      case 'Oranje':
        return prikMasineOranje;
      case 'Podrivanje':
        return prikMasinePodrivanje;
      case 'Tanjiranje':
        return prikMasineTanjiranje;
      case 'Setvospremanje':
        return prikMasineSetvospremanje;
      case 'Đubrivo *':
        return prikMasineDjubrivo;
      case 'Setva *':
        return prikMasineSetva;
      case 'Prskanje *':
        return prikMasinePrskanje;
      case 'Žetva':
        return prikMasineZetva;
      default:
        return [];
    }
  };

  useEffect(() => {
    loadOperacije();
    loadHemije();
    loadNjivaVelicina();
  }, [id]);

  const loadOperacije = async () => {
    try {
      const result = await database.getAllAsync<Operation>(
        'SELECT * FROM operacije_njive WHERE njiva_id = ? ORDER BY id DESC',
        [Number(id)]
      );

      setOperacije(result);
    } catch (error) {
      console.error('Error loading operations1:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHemije = async () => {
    try {
      const result = await database.getAllAsync<Hemija>(
        'SELECT * FROM hemije ORDER BY naziv ASC'
      );
      setHemije(result);
    } catch (error) {
      console.error('Error loading hemije:', error);
    }
  };

  const loadNjivaVelicina = async () => {
    try {
      const result = await database.getAllAsync<Njiva>(
        'SELECT velicina FROM njive WHERE id = ?',
        [Number(id)]
      );
      if (result.length > 0 && result[0].velicina) {
        setNjivaVelicina(result[0].velicina);
      }
    } catch (error) {
      console.error('Error loading njiva velicina:', error);
    }
  };

  const handleDodajHemiju = async () => {
    if (!novaHemijaNaziv.trim()) return;
    
    try {
      await database.runAsync(
        'INSERT INTO hemije (naziv, kolicina_litara, cena_po_litri) VALUES (?, ?, ?)',
        [novaHemijaNaziv.trim(), Number(novaHemijaKolicina) || 0, 0]
      );
      await loadHemije();
      setNovaHemijaNaziv('');
      setNovaHemijaKolicina('');
      setShowDodajHemiju(false);
    } catch (error) {
      console.error('Error adding hemija:', error);
    }
  };

  const handleObrisiHemiju = async (hemijaId: number) => {
    try {
      await database.runAsync('DELETE FROM hemije WHERE id = ?', [hemijaId]);
      await loadHemije();
    } catch (error) {
      console.error('Error deleting hemija:', error);
    }
  };

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  const handleSave = async () => {
    // Validacija obaveznih polja
    if (!vrsta) {
      Alert.alert('Greška', 'Morate izabrati vrstu operacije.');
      return;
    }
    if (!datum.trim()) {
      Alert.alert('Greška', 'Morate uneti datum.');
      return;
    }
    if (!traktor) {
      Alert.alert('Greška', 'Morate izabrati mašinu.');
      return;
    }
    if (!prikMasina) {
      Alert.alert('Greška', 'Morate izabrati priključnu mašinu.');
      return;
    }
    if (!potrosnja.trim()) {
      Alert.alert('Greška', 'Morate uneti potrošnju goriva.');
      return;
    }
    if (!radnik.trim()) {
      Alert.alert('Greška', 'Morate uneti ime radnika.');
      return;
    }
    // Količina i Cena su obavezni za Đubrivo, Setva, Prskanje
    if (vrsta === 'Đubrivo *' || vrsta === 'Setva *' || vrsta === 'Prskanje *') {
      if (!kolicina.trim()) {
        Alert.alert('Greška', 'Morate uneti količinu.');
        return;
      }
      // Cena je obavezna za Đubrivo i Setva (za Prskanje se automatski popunjava iz magacina)
      if (vrsta !== 'Prskanje *' && !cena.trim()) {
        Alert.alert('Greška', 'Morate uneti cenu.');
        return;
      }
    }
    // Hemija obavezna za Prskanje
    if (vrsta === 'Prskanje *' && !selectedHemijaId) {
      Alert.alert('Greška', 'Morate izabrati hemiju iz magacina.');
      return;
    }

    try {
      // Ako je Prskanje i izabrana je hemija, proveri stanje i oduzmi
      if (vrsta === 'Prskanje *' && selectedHemijaId && kolicina && njivaVelicina > 0) {
        const kolicinaPoHa = Number(kolicina);
        const ukupnaKolicina = kolicinaPoHa * njivaVelicina;
        
        const hemijaResult = await database.getAllAsync<Hemija>(
          'SELECT * FROM hemije WHERE id = ?',
          [selectedHemijaId]
        );
        
        if (hemijaResult.length > 0) {
          const hemija = hemijaResult[0];
          if (hemija.kolicina_litara < ukupnaKolicina) {
            Alert.alert('Greška', `Nemate dovoljno ${hemija.naziv} u magacinu. Potrebno: ${ukupnaKolicina.toFixed(2)}L, Na stanju: ${hemija.kolicina_litara.toFixed(2)}L`);
            return;
          }
          // Oduzmi sa stanja
          await database.runAsync(
            'UPDATE hemije SET kolicina_litara = kolicina_litara - ? WHERE id = ?',
            [ukupnaKolicina, selectedHemijaId]
          );
        }
      }

      await database.runAsync(
        'INSERT INTO operacije_njive (datum, vrsta, traktor, prik_masina, potrosnja, radnik, kolicina, cena, opis, hemija_id, njiva_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [datum || null, vrsta, traktor || null, prikMasina || null, potrosnja || null, radnik || null, kolicina || 0, cena || 0, opis || null, selectedHemijaId, Number(id)]
      );
      
      await loadOperacije();
      await loadHemije();
      
      // reset modal state and close
      resetModalState();
    } catch (error) {
      console.error('Error saving operation:', error);
    }
  };

  const resetModalState = () => {
    setModalVisible(false);
    setDatum('');
    setVrsta('');
    setTraktor('');
    setPrikMasina('');
    setPotrosnja('');
    setOpis('');
    setRadnik('');
    setKolicina('');
    setCena('');
    setShowVrstaDropdown(false);
    setShowTraktorDropdown(false);
    setShowPrikMasinaDropdown(false);
    setSelectedHemijaId(null);
    setShowHemijaDropdown(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedForDelete(new Set());
  };

  const toggleSelectForDelete = (operacijaId: number) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(operacijaId)) {
      newSelected.delete(operacijaId);
    } else {
      newSelected.add(operacijaId);
    }
    setSelectedForDelete(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) return;

    Alert.alert(
      'Potvrda',
      `Da li želiš izbrisati ${selectedForDelete.size} ${selectedForDelete.size === 1 ? 'operaciju' : 'operacije'}?`,
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const operacijaId of selectedForDelete) {
                await database.runAsync(
                  'DELETE FROM operacije_njive WHERE id = ?',
                  [operacijaId]
                );
              }
              
              await loadOperacije();
              setDeleteMode(false);
              setSelectedForDelete(new Set());
            } catch (error) {
              console.error('Error deleting operations:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
      edges={['top', 'left', 'right']}
    >
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
                {name} | Operacije
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
              onPress={() => console.log("Settings")}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="black" />
            </TouchableOpacity>
            <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
              <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>
                {dateString}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-gray-800">
        <View className={`flex-1 self-center w-full max-w-screen-lg ${isLandscape ? 'flex-row gap-6 px-6 py-8' : 'flex-col gap-4 p-4 pt-6'}`}>
          {/* Leva strana - Slika */}
          <View className={`${isLandscape ? 'flex-1' : 'flex-1'}`}>
            <View className="overflow-hidden shadow-lg shadow-black/50 bg-green-800 border-2 border-black h-full">
              <Image
                source={njiveImages[slika as string]}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>

          {/* Desna strana - Kontejner za operacije */}
          <View className={`${isLandscape ? 'flex-1' : 'flex-1'}`}>
            <View className="bg-gray-700 rounded-2xl overflow-hidden shadow-lg shadow-black/50 border border-black h-full flex-col">
              {/* Header kontejnera */}
              <View className="bg-blue-600 px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="list-outline" size={24} color="white" />
                  <Text className={`text-white font-bold ml-2 ${isLandscape ? 'text-xl' : 'text-lg'}`}>
                    Operacije
                  </Text>
                </View>
                
                <View className="flex-row items-center gap-2">
                  {/* Dugme za brisanje režim */}
                  <TouchableOpacity
                    onPress={toggleDeleteMode}
                    className={`rounded-full w-10 h-10 items-center justify-center ${deleteMode ? 'bg-red-600' : 'bg-white'}`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={24} color={deleteMode ? "white" : "#000000"} />
                  </TouchableOpacity>

                  {/* Dugme za dodavanje */}
                  {!deleteMode && (
                    <TouchableOpacity
                      onPress={() => {
                        const now = new Date();
                        const dd = String(now.getDate()).padStart(2, '0');
                        const mm = String(now.getMonth() + 1).padStart(2, '0');
                        const yyyy = now.getFullYear();
                        setDatum(`${dd}.${mm}.${yyyy}`);
                        setModalVisible(true);
                      }}
                      className="bg-white rounded-full w-10 h-10 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={28} color="#000000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Delete mode bar */}
              {deleteMode && (
                <View className="bg-red-600 px-4 py-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-white font-semibold">
                      {selectedForDelete.size} izabrano
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedForDelete.size === operacije.length) {
                          setSelectedForDelete(new Set());
                        } else {
                          setSelectedForDelete(new Set(operacije.map(op => op.id)));
                        }
                      }}
                      className="bg-white/20 px-3 py-1.5 rounded"
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-semibold text-sm">
                        {selectedForDelete.size === operacije.length ? 'Poništi sve' : 'Označi sve'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={toggleDeleteMode}
                      className="bg-gray-700 px-4 py-2 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-semibold">Otkaži</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteSelected}
                      className={`px-4 py-2 rounded-lg ${selectedForDelete.size > 0 ? 'bg-white' : 'bg-gray-500'}`}
                      activeOpacity={0.7}
                      disabled={selectedForDelete.size === 0}
                    >
                      <Text className={`font-semibold ${selectedForDelete.size > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                        Obriši
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Sadržaj - lista operacija */}
              <View className="flex-1">
                {loading ? (
                  <View className="flex-1 items-center justify-center p-8">
                    <Text className="text-gray-400">Učitavanje...</Text>
                  </View>
                ) : operacije.length === 0 ? (
                  <View className="flex-1 items-center justify-center p-8">
                    <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
                    <Text className="text-gray-400 text-center mt-4 text-base">
                      Nema operacija za ovu njivu
                    </Text>
                    <Text className="text-gray-500 text-center mt-2 text-sm">
                      Kliknite na + da dodate prvu operaciju
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={operacije}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => deleteMode && toggleSelectForDelete(item.id)}
                        activeOpacity={deleteMode ? 0.6 : 1}
                      >
                        <View className={`bg-gray-600 rounded-lg p-4 py-2 border ${
                          selectedForDelete.has(item.id) 
                            ? 'border-red-500 border-2' 
                            : 'border-gray-500'
                        }`}>
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              {deleteMode && (
                                <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                                  selectedForDelete.has(item.id)
                                    ? 'bg-red-600 border-red-600'
                                    : 'border-gray-400'
                                }`}>
                                  {selectedForDelete.has(item.id) && (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                  )}
                                </View>
                              )}
                              <Text className="text-white font-bold text-lg flex-1">
                                {item.vrsta} | {item.datum || dateString}
                              </Text>
                            </View>
                          </View>
                          
                          {item.radnik && (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="person-outline" size={16} color="#9ca3af" />
                              <Text className="text-gray-300 ml-2">Radnik: {item.radnik}</Text>
                            </View>
                          )}
                          
                          {item.traktor && (
                            <View className="flex-row items-center mt-1">
                              <FontAwesome5 name="tractor" size={13} color="#9ca3af" />
                              <Text className="text-gray-300 ml-2">Mašina: {item.traktor} + {item.prik_masina}</Text>
                            </View>
                          )}

                          {item.potrosnja && (
                            <View className="flex-row items-center mt-1">
                              <MaterialCommunityIcons name="fuel" size={17} color="#9ca3af" />
                              <Text className="text-gray-300 ml-2">Potrošnja: {item.potrosnja} Litara</Text>
                            </View>
                          )}

                          {item.kolicina > 0 && (
                            <View className="flex-row items-center mt-1">
                              <AntDesign name="container" size={16} color="#9ca3af" />
                              <Text className="text-gray-300 ml-2">Količina: {item.kolicina} Litara</Text>
                            </View>
                          )}

                          {item.cena > 0 && (
                            <View className="flex-row items-center mt-1">
                              <FontAwesome6 name="coins" size={15} color="#9ca3af" />
                              <Text className="text-gray-300 ml-2">Cena: {item.cena} RSD</Text>
                            </View>
                          )}  

                          {item.opis && (
                            <View className="flex-row items-start mt-1">
                              <Ionicons name="information-circle-outline" size={16} color="#9ca3af" style={{ marginTop: 2 }} />
                              <Text className="text-gray-300 ml-2 flex-1">Opis: {item.opis}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </View>


{/* Modal za dodavanje operacije */}
    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => resetModalState()}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View
            className="bg-gray-800 rounded-2xl w-full max-w-md border-2 border-gray-600"
            style={{ maxHeight: isLandscape ? '90%' : '80%' }}
          >
            {/* Header */}
            <View className="bg-blue-600 px-5 py-4 flex-row items-center justify-between rounded-t-2xl">
              <Text className="text-white font-bold text-xl">Nova operacija</Text>
              <TouchableOpacity onPress={() => resetModalState()}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingBottom: isLandscape ? 40 : 90 }}
            >
              {/* Datum */}
              <View className="mb-4">
                <Text className="text-white font-semibold mb-2 text-base">Datum</Text>
                <TextInput
                  value={datum}
                  onChangeText={setDatum}
                  placeholder="dd.mm.yyyy"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
              </View>

              {/* Vrsta operacije */}
              <View className="mb-4">
                <Text className="text-white font-semibold mb-2 text-base">Vrsta operacije *</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowVrstaDropdown(!showVrstaDropdown);
                    setShowTraktorDropdown(false);
                    setShowPrikMasinaDropdown(false);
                    setShowHemijaDropdown(false);
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between"
                >
                  <Text className={vrsta ? "text-white" : "text-gray-400"}>
                    {vrsta || "Izaberite vrstu"}
                  </Text>
                  <Ionicons name={showVrstaDropdown ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                </TouchableOpacity>
                {showVrstaDropdown && (
                  <View className="mt-1 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                    {vrsteOperacija.map((v, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setVrsta(v);
                          setShowVrstaDropdown(false);
                          // Reset all fields except datum
                          setTraktor('');
                          setPrikMasina('');
                          setPotrosnja('');
                          setRadnik('');
                          setKolicina('');
                          setCena('');
                          setOpis('');
                          setSelectedHemijaId(null);
                          setShowHemijaDropdown(false);
                          setShowTraktorDropdown(false);
                          setShowPrikMasinaDropdown(false);
                        }}
                        className={`px-4 py-3 ${index < vrsteOperacija.length - 1 ? 'border-b border-gray-600' : ''} ${v === vrsta ? 'bg-blue-600/30' : ''}`}
                      >
                        <Text className={v === vrsta ? "text-blue-400 font-semibold" : "text-white"}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Traktor */}
              <View className="mb-4 flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-semibold mb-2 text-base">Mašina *</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowTraktorDropdown(!showTraktorDropdown);
                      setShowVrstaDropdown(false);
                      setShowPrikMasinaDropdown(false);
                      setShowHemijaDropdown(false);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 flex-row items-center justify-between"
                  >
                    <Text className={traktor ? "text-white" : "text-gray-400"}>
                      {traktor || "Izaberite"}
                    </Text>
                    <Ionicons name={showTraktorDropdown ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  {showTraktorDropdown && (
                    <View className="mt-1 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      {traktori.length === 0 ? (
                        <View className="px-4 py-3">
                          <Text className="text-gray-400">Nema dostupnih traktora</Text>
                        </View>
                      ) : (
                        traktori.map((t, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setTraktor(t);
                              setShowTraktorDropdown(false);
                            }}
                            className={`px-4 py-3 ${index < traktori.length - 1 ? 'border-b border-gray-600' : ''} ${t === traktor ? 'bg-blue-600/30' : ''}`}
                          >
                            <Text className={t === traktor ? "text-blue-400 font-semibold" : "text-white"}>{t}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>

                {/* Potrošnja */}
                <View className="w-[40%]">
                  <Text className="text-white font-semibold mb-2 text-base">Potrošnja goriva</Text>
                  <TextInput
                    value={potrosnja}
                    onChangeText={setPotrosnja}
                    placeholder="L/ha"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white"
                  />
                </View>
              </View>

              {/* Priključna mašina i Ime radnika */}
              <View className="mb-4 flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-semibold mb-2 text-base">Priključna mašina</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPrikMasinaDropdown(!showPrikMasinaDropdown);
                      setShowVrstaDropdown(false);
                      setShowTraktorDropdown(false);
                      setShowHemijaDropdown(false);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 flex-row items-center justify-between"
                  >
                    <Text className={prikMasina ? "text-white" : "text-gray-400"}>
                      {prikMasina || "Izaberite"}
                    </Text>
                    <Ionicons name={showPrikMasinaDropdown ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  {showPrikMasinaDropdown && (
                    <View className="mt-1 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      {getPrikMasineZaVrstu().length === 0 ? (
                        <View className="px-4 py-3">
                          <Text className="text-gray-400">Nema dostupnih mašina</Text>
                        </View>
                      ) : (
                        getPrikMasineZaVrstu().map((m, index) => {
                          const masine = getPrikMasineZaVrstu();
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                setPrikMasina(m);
                                setShowPrikMasinaDropdown(false);
                              }}
                              className={`px-4 py-3 ${index < masine.length - 1 ? 'border-b border-gray-600' : ''} ${m === prikMasina ? 'bg-blue-600/30' : ''}`}
                            >
                              <Text className={m === prikMasina ? "text-blue-400 font-semibold" : "text-white"}>{m}</Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-white font-semibold mb-2 text-base">Ime radnika</Text>
                  <TextInput
                    value={radnik}
                    onChangeText={setRadnik}
                    placeholder="Unesite ime"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white"
                  />
                </View>
              </View>

              {/* Hemija combobox (samo za Prskanje) */}
              {vrsta === 'Prskanje *' && (
                <View className="mb-4">
                  <Text className="text-white font-semibold mb-2 text-base">Hemija iz magacina</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowHemijaDropdown(!showHemijaDropdown);
                      setShowVrstaDropdown(false);
                      setShowTraktorDropdown(false);
                      setShowPrikMasinaDropdown(false);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text className={selectedHemijaId ? "text-white" : "text-gray-400"}>
                      {selectedHemijaId ? (hemije.find(h => h.id === selectedHemijaId)?.naziv ?? 'Izabrana hemija') : 'Izaberite hemiju'}
                    </Text>
                    <Ionicons name={showHemijaDropdown ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                  {showHemijaDropdown && (
                    <View className="mt-1 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      {hemije.length === 0 ? (
                        <View className="px-4 py-3">
                          <Text className="text-gray-400">Magacin je prazan</Text>
                        </View>
                      ) : (
                        hemije.map((h, index) => (
                          <TouchableOpacity
                            key={h.id}
                            onPress={() => {
                              setSelectedHemijaId(h.id);
                              setCena(h.cena_po_litri.toString());
                              setShowHemijaDropdown(false);
                            }}
                            className={`px-4 py-3 ${index < hemije.length - 1 ? 'border-b border-gray-600' : ''} ${h.id === selectedHemijaId ? 'bg-blue-600/30' : ''}`}
                          >
                            <View className="flex-row items-center justify-between">
                              <Text className={h.id === selectedHemijaId ? "text-blue-400 font-semibold" : "text-white"}>{h.naziv}</Text>
                              <View className="flex-row items-center">
                                <Text className="text-yellow-400 mr-3">{h.cena_po_litri.toFixed(0)} RSD/L</Text>
                                <Text className="text-gray-400">{h.kolicina_litara.toFixed(2)} L</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Količina i Cena - prikazuje se samo za određene operacije */}
              {(vrsta === "Đubrivo *" || vrsta === "Setva *" || vrsta === "Prskanje *") && (
                <View className="mb-4 flex-row justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-semibold mb-2 text-base">Količina po ha</Text>
                    <TextInput
                      value={kolicina}
                      onChangeText={setKolicina}
                      placeholder={vrsta === 'Prskanje *' ? 'L/ha' : 'kg/ha'}
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    />
                  </View>

                  <View className="flex-1 ml-2">
                    <Text className="text-white font-semibold mb-2 text-base">Cena</Text>
                    {vrsta === 'Prskanje *' ? (
                      <View className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3">
                        <Text className={cena ? "text-yellow-400 font-bold" : "text-gray-400"}>
                          {cena ? `${cena} RSD` : 'Izaberite hemiju'}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        value={cena}
                        onChangeText={setCena}
                        placeholder="RSD"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                      />
                    )}
                  </View>
                </View>
              )}

              {/* Opis */}
              <View className="mb-4">
                <Text className="text-white font-semibold mb-2 text-base">Opis</Text>
                <TextInput
                  value={opis}
                  onChangeText={setOpis}
                  placeholder="Unesite opis operacije"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
              </View>

            </ScrollView>

            {/* Fixed Footer with Buttons */}
            <View className="px-5 py-4 border-t border-gray-600 bg-gray-800 rounded-b-2xl">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => resetModalState()}
                  className="flex-1 bg-gray-600 rounded-lg py-3 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-base">Otkaži</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-base">Sačuvaj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}