import { Stack } from 'expo-router';

export default function TicketSupportLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Air Ticket Support'
        }} 
      />
    </Stack>
  );
}