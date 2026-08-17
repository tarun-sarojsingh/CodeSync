import randomColor from 'randomcolor';

const ANIMALS = [
  'Badger', 'Fox', 'Bear', 'Wolf', 'Eagle', 'Tiger', 'Lion', 'Panda', 
  'Koala', 'Hawk', 'Owl', 'Dolphin', 'Penguin', 'Cheetah', 'Rhino',
  'Leopard', 'Panther', 'Falcon', 'Raven', 'Otter'
];

export interface UserInfo {
  name: string;
  color: string;
}

export function generateRandomUser(): UserInfo {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const name = `Anonymous ${animal}`;
  
  // Use vibrant colors that look good in dark mode
  const color = randomColor({
    luminosity: 'bright',
    format: 'hex'
  });

  return { name, color };
}
