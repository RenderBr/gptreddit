const bgColors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-400",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-lime-500"
];

const txtColors = [
    "text-blue-500",
    "text-red-500",
    "text-green-500",
    "text-yellow-400",
    "text-purple-500",
    "text-indigo-500",
    "text-pink-500",
    "text-teal-500",
    "text-orange-500",
    "text-lime-500"
];


const colors = {
    getRandomBgColor: function() {
        return bgColors[Math.floor(Math.random() * bgColors.length)];
    },
    getRandomTxtColor: function() {
        return txtColors[Math.floor(Math.random() * txtColors.length)];
    }
};

export default colors;
