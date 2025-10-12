import type { Scientist } from './types.ts';

export const CHAPTERS_BY_GRADE = {
  6: [
    "The Wonderful World of Science",
    "Diversity in the Living World",
    "Mindful Eating: A Path to a Healthy Body",
    "Exploring Magnets",
    "Measurement of Length and Motion",
    "Materials Around Us",
    "Temperature and its Measurement",
    "A Journey through States of Water",
    "Methods of Separation in Everyday Life",
    "Living Creatures: Exploring their Characteristics",
    "Nature’s Treasures",
    "Beyond Earth",
  ],
  7: [
    "The Ever-Evolving World of Science",
    "Exploring Substances: Acidic, Basic, and Neutral",
    "Electricity: Circuits and their Components",
    "The World of Metals and Non-metals",
    "Changes Around Us: Physical and Chemical",
    "Adolescence: A Stage of Growth and Change",
    "Heat Transfer in Nature",
    "Measurement of Time and Motion",
    "Life Processes in Animals",
    "Life Processes in Plants",
    "Light: Shadows and Reflections",
    "Earth, Moon, and the Sun",
  ],
  8: [
    "Exploring the Investigative World of Science",
    "The Invisible Living World: Beyond Our Naked Eye",
    "Health: The Ultimate Treasure",
    "Electricity: Magnetic and Heating Effects",
    "Exploring Forces",
    "Pressure, Winds, Storms, and Cyclones",
    "Particulate Nature of Matter",
    "Nature of Matter: Elements, Compounds, and Mixtures",
    "The Amazing World of Solutes, Solvents, and Solutions",
    "Light: Mirrors and Lenses",
    "Keeping Time with the Skies",
    "How Nature Works in Harmony",
    "Our Home: Earth, a Unique Life Sustaining Planet",
  ],
  9: [
    "MATTER IN OUR SURROUNDINGS",
    "IS MATTER AROUND US PURE?",
    "ATOMS AND MOLECULES",
    "STRUCTURE OF THE ATOM",
    "THE FUNDAMENTAL UNIT OF LIFE",
    "TISSUES",
    "MOTION",
    "FORCE AND LAWS OF MOTION",
    "GRAVITATION",
    "WORK AND ENERGY",
    "SOUND",
    "IMPROVEMENT IN FOOD RESOURCES",
  ],
  10: [
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and its Compounds",
    "Life Processes",
    "Control and Coordination",
    "How do Organisms Reproduce?",
    "Heredity",
    "Light – Reflection and Refraction",
    "The Human Eye and the Colourful World",
    "Electricity",
    "Magnetic Effects of Electric Current",
    "Our Environment",
  ],
};

export const SCIENTISTS: Scientist[] = [
  { name: 'Albert Einstein', field: 'Theoretical Physicist', description: 'Developed the theory of relativity, one of the two pillars of modern physics.' },
  { name: 'Marie Curie', field: 'Physicist and Chemist', description: 'Conducted pioneering research on radioactivity and was the first woman to win a Nobel Prize.' },
  { name: 'Isaac Newton', field: 'Mathematician & Physicist', description: 'Formulated the laws of motion and universal gravitation, which dominated scientists\' view of the physical universe for three centuries.' },
  { name: 'Charles Darwin', field: 'Naturalist & Biologist', description: 'Best known for his contributions to the science of evolution and the theory of natural selection.' },
  { name: 'Galileo Galilei', field: 'Astronomer & Physicist', description: 'The "father of observational astronomy," he made major improvements to the telescope and supported Copernicanism.' },
  { name: 'C. V. Raman', field: 'Physicist', description: 'Won the Nobel Prize for his work on light scattering and for the discovery of the effect named after him.' },
];

export const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen' },
  { symbol: 'He', name: 'Helium' },
  { symbol: 'Li', name: 'Lithium' },
  { symbol: 'Be', name: 'Beryllium' },
  { symbol: 'B', name: 'Boron' },
  { symbol: 'C', name: 'Carbon' },
  { symbol: 'N', name: 'Nitrogen' },
  { symbol: 'O', name: 'Oxygen' },
  { symbol: 'F', name: 'Fluorine' },
  { symbol: 'Ne', name: 'Neon' },
  { symbol: 'Na', name: 'Sodium' },
  { symbol: 'Mg', name: 'Magnesium' },
  { symbol: 'Al', name: 'Aluminum' },
  { symbol: 'Si', name: 'Silicon' },
  { symbol: 'P', name: 'Phosphorus' },
  { symbol: 'S', name: 'Sulfur' },
  { symbol: 'Cl', name: 'Chlorine' },
  { symbol: 'Ar', name: 'Argon' },
  { symbol: 'K', name: 'Potassium' },
  { symbol: 'Ca', name: 'Calcium' },
  { symbol: 'Fe', name: 'Iron' },
  { symbol: 'Co', name: 'Cobalt' },
  { symbol: 'Ni', name: 'Nickel' },
  { symbol: 'Cu', name: 'Copper' },
  { symbol: 'Zn', name: 'Zinc' },
  { symbol: 'Ag', name: 'Silver' },
  { symbol: 'Au', name: 'Gold' },
  { symbol: 'Hg', name: 'Mercury' },
  { symbol: 'Pb', name: 'Lead' },
  { symbol: 'U', name: 'Uranium' },
  { symbol: 'Sn', name: 'Tin' },
  { symbol: 'I', name: 'Iodine' },
];

// --- Data for New Games ---

export const LAB_SAFETY_RULES = [
    { rule: "Wearing safety goggles at all times.", type: 'Safe' },
    { rule: "Tasting chemicals to identify them.", type: 'Unsafe' },
    { rule: "Tying back long hair.", type: 'Safe' },
    { rule: "Mixing unknown chemicals together.", type: 'Unsafe' },
    { rule: "Washing hands after an experiment.", type: 'Safe' },
    { rule: "Pointing a test tube at yourself or others.", type: 'Unsafe' },
    { rule: "Reading all instructions before starting.", type: 'Safe' },
    { rule: "Eating or drinking in the lab.", type: 'Unsafe' },
    { rule: "Cleaning up your work area.", type: 'Safe' },
    { rule: "Leaving an experiment unattended.", type: 'Unsafe' },
];

export const PLANETS = [
    { name: "Mercury", order: 1 },
    { name: "Venus", order: 2 },
    { name: "Earth", order: 3 },
    { name: "Mars", order: 4 },
    { name: "Jupiter", order: 5 },
    { name: "Saturn", order: 6 },
    { name: "Uranus", order: 7 },
    { name: "Neptune", order: 8 },
];

export const STATES_OF_MATTER_ITEMS = [
    { item: "Ice", state: "Solid" },
    { item: "Water", state: "Liquid" },
    { item: "Steam", state: "Gas" },
    { item: "Rock", state: "Solid" },
    { item: "Milk", state: "Liquid" },
    { item: "Oxygen", state: "Gas" },
    { item: "Wood", state: "Solid" },
    { item: "Juice", state: "Liquid" },
    { item: "Helium", state: "Gas" },
    { item: "Iron Bar", state: "Solid" },
];

export const SCIENTIFIC_METHOD_STEPS = [
    { step: "Ask a Question", order: 1 },
    { step: "Do Background Research", order: 2 },
    { step: "Construct a Hypothesis", order: 3 },
    { step: "Test with an Experiment", order: 4 },
    { step: "Analyze Data", order: 5 },
    { step: "Draw a Conclusion", order: 6 },
];

export const FOOD_CHAINS = [
    { name: "Grassland", chain: ["Grass", "Grasshopper", "Frog", "Snake"] },
    { name: "Forest", chain: ["Oak Tree", "Caterpillar", "Blue Jay", "Hawk"] },
    { name: "Ocean", chain: ["Algae", "Krill", "Fish", "Seal"] },
    { name: "Pond", chain: ["Algae", "Tadpole", "Fish", "Heron"] },
];

export const INVENTIONS = [
    { name: "Telescope", options: ["15th Century", "16th Century", "17th Century"], answer: "17th Century" },
    { name: "Telephone", options: ["18th Century", "19th Century", "20th Century"], answer: "19th Century" },
    { name: "Light Bulb", options: ["18th Century", "19th Century", "20th Century"], answer: "19th Century" },
    { name: "Airplane", options: ["19th Century", "20th Century", "21st Century"], answer: "20th Century" },
    { name: "Computer", options: ["19th Century", "20th Century", "21st Century"], answer: "20th Century" },
    { name: "Printing Press", options: ["15th Century", "16th Century", "17th Century"], answer: "15th Century" },
];

// --- Data for 5 More Fun Games ---

export const SCIENTIST_DISCOVERIES = [
    { name: 'Albert Einstein', discovery: 'Theory of Relativity' },
    { name: 'Marie Curie', discovery: 'Radioactivity' },
    { name: 'Isaac Newton', discovery: 'Laws of Motion' },
    { name: 'Charles Darwin', discovery: 'Theory of Evolution' },
    { name: 'Galileo Galilei', discovery: 'Telescopic Observations' },
    { name: 'Louis Pasteur', discovery: 'Pasteurization' },
    { name: 'Gregor Mendel', discovery: 'Genetics' },
    { name: 'Alexander Fleming', discovery: 'Penicillin' },
];

export const ANATOMY_QUESTIONS = [
    { question: 'Which organ pumps blood through the body?', options: ['Lungs', 'Stomach', 'Heart', 'Liver'], answer: 'Heart' },
    { question: 'What is the main function of the lungs?', options: ['Digestion', 'Breathing', 'Thinking', 'Filtering Waste'], answer: 'Breathing' },
    { question: 'Which part of the body controls everything you do?', options: ['Heart', 'Brain', 'Muscles', 'Bones'], answer: 'Brain' },
    { question: 'What protects your brain?', options: ['Ribs', 'Skin', 'Skull', 'Spine'], answer: 'Skull' },
    { question: 'Which organ helps in digesting food?', options: ['Stomach', 'Kidneys', 'Heart', 'Lungs'], answer: 'Stomach' },
    { question: 'What gives your body structure and support?', options: ['Muscles', 'Organs', 'Skeleton', 'Skin'], answer: 'Skeleton' },
];

export const LAB_TOOLS = [
    { name: 'Microscope', use: 'To view very small objects' },
    { name: 'Beaker', use: 'To hold and mix liquids' },
    { name: 'Test Tube', use: 'To hold small amounts of liquid' },
    { name: 'Bunsen Burner', use: 'To heat substances' },
    { name: 'Graduated Cylinder', use: 'To measure the volume of a liquid' },
    { name: 'Safety Goggles', use: 'To protect the eyes' },
];

export const ANIMALS_FOR_CLASSIFICATION = [
    { name: 'Dolphin', class: 'Mammal' },
    { name: 'Eagle', class: 'Bird' },
    { name: 'Snake', class: 'Reptile' },
    { name: 'Shark', class: 'Fish' },
    { name: 'Frog', class: 'Amphibian' },
    { name: 'Spider', class: 'Arachnid' },
    { name: 'Butterfly', class: 'Insect' },
    { name: 'Bat', class: 'Mammal' },
    { name: 'Penguin', class: 'Bird' },
    { name: 'Lizard', class: 'Reptile' },
    { name: 'Salmon', class: 'Fish' },
    { name: 'Salamander', class: 'Amphibian' },
];