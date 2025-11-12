// No sprite loading needed - we'll draw shapes procedurally
// This keeps the bundle tiny and visuals clear

export const ASSETS = {
  // We'll use Kaboom's shape drawing instead of sprites
  useShapes: true
};

// Character configurations - Political parties
export const CHARACTERS = [
  {
    id: "ncp",
    name: "NCP",
    fullName: "National Congress Party",
    sprite: "char1",
    speed: 200,
    health: 100,
    fireRate: 0.15,
    color: "#00A651", // Green
    description: "Balanced Fighter"
  },
  {
    id: "bnp",
    name: "BNP",
    fullName: "Bangladesh Nationalist Party",
    sprite: "char2",
    speed: 180,
    health: 120,
    fireRate: 0.18,
    color: "#FFA500", // Orange
    description: "Heavy Defender"
  },
  {
    id: "jamat",
    name: "JAMAT",
    fullName: "Jamaat-e-Islami",
    sprite: "char3",
    speed: 220,
    health: 80,
    fireRate: 0.12,
    color: "#8B4513", // Brown
    description: "Fast Attacker"
  }
];
