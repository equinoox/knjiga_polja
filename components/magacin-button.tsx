import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function MagacinButton({ isLandscape }: { isLandscape?: boolean }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/magacin')}
      className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-2`}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="warehouse" size={22} color="black" />
    </TouchableOpacity>
  );
}
