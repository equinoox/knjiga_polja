import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
  velicina?: number | null;
}

interface Prihod {
  id: number;
  datum: string;
  izvor: string | null;
  iznos: number | null;
  njiva_id: number;
}

export default function FieldDetailScreen() {
  const router = useRouter();
  const database = useSQLiteContext();
  const { category, id, name, slika, velicina, pripadnost, opis } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  const handleExportPDF = () => {
    Alert.alert(
      'Potvrda',
      'Da li želiš da odštampaš informacije o njivi?',
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Da',
          onPress: async () => {
            try {
              const operacije = await database.getAllAsync<Operation>(
                'SELECT o.*, n.velicina as velicina FROM operacije_njive o JOIN njive n ON o.njiva_id = n.id WHERE o.njiva_id = ? ORDER BY o.id ASC',
                [Number(id)]
              );

              const prihodiData = await database.getAllAsync<Prihod>(
                'SELECT * FROM prihodi_njive WHERE njiva_id = ? ORDER BY id ASC',
                [Number(id)]
              );

              // Ukupna potrosnja goriva
              const ukupnaPotrosnja = operacije.reduce((sum, op) => sum + (op.potrosnja || 0), 0);

              // Opis setve
              const setvaOp = operacije.find(op => op.vrsta === 'Setva *');
              const opisSetve = setvaOp?.opis || 'Nema podataka';

              // Operacije table rows
              const operacijeRows = operacije.map((op) => {
                const rows: string[] = [];
                if (op.radnik) rows.push(`<strong>Radnik:</strong> ${op.radnik}`);
                if (op.traktor) rows.push(`<strong>Mašina:</strong> ${op.traktor}${op.prik_masina ? ' + ' + op.prik_masina : ''}`);
                if (op.potrosnja) rows.push(`<strong>Potrošnja:</strong> ${op.potrosnja} L`);
                if (op.kolicina > 0) rows.push(`<strong>Količina:</strong> ${op.kolicina} L`);
                if (op.cena > 0) rows.push(`<strong>Cena:</strong> ${op.cena} RSD`);
                if (op.opis) rows.push(`<strong>Opis:</strong> ${op.opis}`);
                const detailsHtml = rows.length > 0 ? rows.map(r => `<div style="margin:3px 0;">${r}</div>`).join('') : '-';
                return `
                  <tr>
                    <td><strong>${op.vrsta}</strong></td>
                    <td>${op.datum || dateString}</td>
                    <td>${detailsHtml}</td>
                  </tr>`;
              }).join('');

              // Rashodi - computed from operations (same formula as rashodi page)
              let ukupnoRashodi = 0;
              const rashodiRows = operacije.map((op) => {
                const rashodGoriva = (op.potrosnja || 0) * 120;
                const vel = op.velicina ?? 1;
                const rashodMaterijala = (op.kolicina || 0) * (op.cena || 0) * vel;
                const ukupan = rashodGoriva + rashodMaterijala;
                ukupnoRashodi += ukupan;
                return `
                  <tr>
                    <td>${op.vrsta}</td>
                    <td>${op.datum || dateString}</td>
                    <td style="text-align:right">${rashodGoriva.toFixed(2)} RSD</td>
                    <td style="text-align:right">${rashodMaterijala.toFixed(2)} RSD</td>
                    <td style="text-align:right"><strong>${ukupan.toFixed(2)} RSD</strong></td>
                  </tr>`;
              }).join('');

              // Prihodi rows
              let ukupnoPrihodi = 0;
              const prihodiRows = prihodiData.map((p) => {
                ukupnoPrihodi += p.iznos || 0;
                return `
                  <tr>
                    <td>${p.izvor || '-'}</td>
                    <td>${p.datum}</td>
                    <td style="text-align:right"><strong>${(p.iznos || 0).toFixed(2)} RSD</strong></td>
                  </tr>`;
              }).join('');

              const html = `
                <html>
                  <head>
                    <meta charset="utf-8" />
                    <style>
                      body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
                      h1 { color: #166534; border-bottom: 3px solid #166534; padding-bottom: 10px; }
                      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
                      .info-box { background: #f3f4f6; border-radius: 8px; padding: 12px; border-left: 4px solid #166534; }
                      .info-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
                      .info-value { font-size: 16px; font-weight: bold; color: #333; }
                      .highlight-box { background: #dcfce7; border-radius: 8px; padding: 12px; border-left: 4px solid #166534; margin: 10px 0; }
                      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                      th { background-color: #166534; color: white; padding: 12px 8px; text-align: left; }
                      td { padding: 10px 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
                      tr:nth-child(even) { background-color: #f9f9f9; }
                      h2 { color: #166534; margin-top: 30px; }
                      .total-row { background: #dcfce7; font-weight: bold; }
                      .total-row-red { background: #fee2e2; font-weight: bold; }
                      .total-row-green { background: #dcfce7; font-weight: bold; }
                    </style>
                  </head>
                  <body>
                    <h1>${name}</h1>
                    <h3>Datum: ${dateString}</h3>
                    
                    <div class="info-grid">
                      <div class="info-box">
                        <div class="info-label">Vlasnik polja</div>
                        <div class="info-value">${pripadnost || 'N/A'}</div>
                      </div>
                      <div class="info-box">
                        <div class="info-label">Naziv njive</div>
                        <div class="info-value">${name}</div>
                      </div>
                      <div class="info-box">
                        <div class="info-label">Katastarski broj</div>
                        <div class="info-value">${opis || 'N/A'}</div>
                      </div>
                      <div class="info-box">
                        <div class="info-label">Veličina njive</div>
                        <div class="info-value">${velicina} ha</div>
                      </div>
                    </div>

                    <div class="highlight-box">
                      <div class="info-label">Ukupna potrošnja goriva</div>
                      <div class="info-value">${ukupnaPotrosnja.toFixed(2)} L</div>
                    </div>

                    <div class="highlight-box">
                      <div class="info-label">Opis setve</div>
                      <div class="info-value">${opisSetve}</div>
                    </div>

                    <h2>Operacije</h2>
                    ${operacije.length === 0 ? '<p style="color:#999;">Nema operacija za ovu njivu.</p>' : `
                    <table>
                      <thead>
                        <tr>
                          <th>Vrsta</th>
                          <th>Datum</th>
                          <th>Detalji</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${operacijeRows}
                      </tbody>
                    </table>
                    `}

                    <h2>Prihodi</h2>
                    ${prihodiData.length === 0 ? '<p style="color:#999;">Nema prihoda za ovu njivu.</p>' : `
                    <table>
                      <thead>
                        <tr>
                          <th>Izvor</th>
                          <th>Datum</th>
                          <th style="text-align:right">Iznos</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${prihodiRows}
                        <tr class="total-row-green">
                          <td colspan="2"><strong>UKUPNO PRIHODI</strong></td>
                          <td style="text-align:right"><strong>${ukupnoPrihodi.toFixed(2)} RSD</strong></td>
                        </tr>
                      </tbody>
                    </table>
                    `}

                    <h2>Rashodi</h2>
                    ${operacije.length === 0 ? '<p style="color:#999;">Nema rashoda za ovu njivu.</p>' : `
                    <table>
                      <thead>
                        <tr>
                          <th>Vrsta</th>
                          <th>Datum</th>
                          <th style="text-align:right">Gorivo</th>
                          <th style="text-align:right">Materijal</th>
                          <th style="text-align:right">Ukupno</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rashodiRows}
                        <tr class="total-row-red">
                          <td colspan="4"><strong>UKUPNO RASHODI</strong></td>
                          <td style="text-align:right"><strong>${ukupnoRashodi.toFixed(2)} RSD</strong></td>
                        </tr>
                      </tbody>
                    </table>
                    `}
                  </body>
                </html>
              `;

              const fileName = `${name} (${dateString})`;
              const { uri } = await Print.printToFileAsync({ html, fileName } as any);
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Odštampaj PDF njive',
                UTI: 'com.adobe.pdf',
              });
            } catch (error) {
              console.error('Error exporting field PDF:', error);
            }
          },
        },
      ]
    );
  };

  const cards = [
    { id: 1, title: 'Operacije', icon: 'list-outline', color: 'bg-blue-600' },
    { id: 2, title: 'Prihodi', icon: 'trending-up-outline', color: 'bg-green-600' },
    { id: 3, title: 'Rashodi', icon: 'trending-down-outline', color: 'bg-red-600' },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
      edges={['top', 'left', 'right']}
    >
      {/* Top bar */}
      <View className={`bg-green-800 border-b border-white ${isLandscape ? 'px-6 py-2.5' : 'px-4 py-2.5'}`}>
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

            {/* Ime njive */}
            <View className="flex-1">
              <Text className={`font-semibold text-white ${isLandscape ? 'text-2xl' : 'text-lg'}`}>
                {category} | {name} {velicina} ha
              </Text>
            </View>
          </View>

          {/* Desna strana - Dugmad i Datum */}
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
              onPress={handleExportPDF}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Settings")}
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
        <View className={`self-center w-full max-w-screen-lg ${isLandscape ? 'flex-row gap-6' : 'flex-col gap-4'}`}>
          {/* Leva strana - Slika */}
          <View className={`${isLandscape ? 'flex-1' : 'w-full h-64'}`}>
            <View className=" overflow-hidden shadow-lg shadow-black/50 bg-green-800 border-2 border-black h-full">
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

          {/* Desna strana - Tri kartice */}
          <View className={`${isLandscape ? 'flex-1' : 'w-full'} gap-4`}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (card.title === 'Prihodi') {
                    router.push({ pathname: '/prihodi/[id]', params: { id: Number(id), name, slika, category, pripadnost } });
                  } else if (card.title === 'Rashodi') {
                    router.push({ pathname: '/rashodi/[id]', params: { id: Number(id), name, slika, category, pripadnost } });
                  } else {
                    router.push({ pathname: '/operations/[id]', params: { filed: name, id: Number(id), name: name, slika: slika } });
                  }
                }}
                className={`${card.color} rounded-2xl overflow-hidden shadow-lg shadow-black/50 border border-black ${isLandscape ? 'h-[calc(33.333%-11px)]' : 'h-32'}`}
              >
                <View className="flex-1 items-center justify-center p-6">
                  <Ionicons name={card.icon as any} size={isLandscape ? 48 : 40} color="white" />
                  <Text className={`text-white font-bold mt-3 ${isLandscape ? 'text-2xl' : 'text-xl'}`}>
                    {card.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prazan prostor na dnu */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}