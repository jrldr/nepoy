export interface PigeonStation {
  name: string;
  category: 'North Line' | 'South Line' | 'Central / Metro' | 'Visayas / Mindanao';
  lat: number;
  lng: number;
  description: string;
}

export const POPULAR_STATIONS: PigeonStation[] = [
  // North Line
  { name: 'Aparri, Cagayan', category: 'North Line', lat: 18.3564, lng: 121.6414, description: 'Northernmost coastal release station (~440km)' },
  { name: 'Tuguegarao City', category: 'North Line', lat: 17.6132, lng: 121.7270, description: 'Cagayan Valley premier release station (~350km)' },
  { name: 'Ilagan, Isabela', category: 'North Line', lat: 17.1472, lng: 121.8841, description: 'Isabela provincial capital (~300km)' },
  { name: 'Cauayan City, Isabela', category: 'North Line', lat: 16.9248, lng: 121.7738, description: 'Major Isabela crossroad station (~270km)' },
  { name: 'Santiago City, Isabela', category: 'North Line', lat: 16.6917, lng: 121.5489, description: 'Southern Isabela gateway (~240km)' },
  { name: 'Bambang, Nueva Vizcaya', category: 'North Line', lat: 16.3888, lng: 121.1075, description: 'Sierra Madre mountain pass station (~190km)' },
  { name: 'San Jose City, Nueva Ecija', category: 'North Line', lat: 15.7925, lng: 120.9898, description: 'Central Luzon plain station (~120km)' },
  { name: 'Cabanatuan City', category: 'North Line', lat: 15.4859, lng: 120.9658, description: 'Nueva Ecija training toss (~90km)' },
  { name: 'McArthur, Pangasinan', category: 'North Line', lat: 15.9012, lng: 120.5283, description: 'Western North Line toss point (~140km)' },
  { name: 'Laoag, Ilocos Norte', category: 'North Line', lat: 18.1960, lng: 120.5927, description: 'Ilocos Coastal Line station (~400km)' },
  { name: 'Vigan, Ilocos Sur', category: 'North Line', lat: 17.5747, lng: 120.3869, description: 'Heritage city toss point (~330km)' },

  // South Line
  { name: 'Lucena City, Quezon', category: 'South Line', lat: 13.9376, lng: 121.6174, description: 'Quezon province toss point (~100km)' },
  { name: 'Naga City, Camarines Sur', category: 'South Line', lat: 13.6218, lng: 123.1948, description: 'Bicol heartland release station (~270km)' },
  { name: 'Legazpi City, Albay', category: 'South Line', lat: 13.1391, lng: 123.7438, description: 'Mayon Volcano vista release (~340km)' },
  { name: 'Sorsogon City', category: 'South Line', lat: 12.9742, lng: 124.0058, description: 'Bicol peninsula tip (~380km)' },
  { name: 'Matnog, Sorsogon', category: 'South Line', lat: 12.5855, lng: 124.0847, description: 'San Bernardino Strait ferry port (~430km)' },
  { name: 'Allen, Northern Samar', category: 'South Line', lat: 12.5008, lng: 124.2844, description: 'First Visayan Island release point (~450km)' },
  { name: 'Catbalogan, Samar', category: 'South Line', lat: 11.7753, lng: 124.8860, description: 'Samar Sea crossing station (~530km)' },
  { name: 'Tacloban City, Leyte', category: 'South Line', lat: 11.2444, lng: 125.0039, description: 'San Juanico bridge release station (~580km)' },
  { name: 'McArthur, Leyte', category: 'South Line', lat: 10.8988, lng: 124.9961, description: 'Historic Leyte landing station (~620km)' },

  // Central / Metro / Loft Hubs
  { name: 'Manila (Rizal Park)', category: 'Central / Metro', lat: 14.5826, lng: 120.9787, description: 'Kilometer Zero / Metro Manila Loft Base' },
  { name: 'Quezon City', category: 'Central / Metro', lat: 14.6760, lng: 121.0437, description: 'Metro Manila North Loft Hub' },
  { name: 'Marikina City', category: 'Central / Metro', lat: 14.6507, lng: 121.1029, description: 'Eastern Metro Loft Hub' },
  { name: 'Cavite City / Imus', category: 'Central / Metro', lat: 14.4296, lng: 120.9367, description: 'Southern Metro / Cavite Loft Center' },
  { name: 'Bulacan (Malolos)', category: 'Central / Metro', lat: 14.8527, lng: 120.8160, description: 'Central Luzon Loft Hub' },
  { name: 'Pampanga (San Fernando)', category: 'Central / Metro', lat: 15.0286, lng: 120.6896, description: 'Pampanga Loft Association Base' },
];
