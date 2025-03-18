function weightedRandom(canvasWidth) {
    let randomValue = Math.random();
    if (randomValue < 0.7) { // 70% chance of being on the right side
        return (0.5 + (Math.random() / 2)) * canvasWidth; // From 50% to 100% of canvas width
    } else { // 30% chance of being on the left side
        return Math.random() * canvasWidth / 2;  // From 0% to 50% of canvas width
    }
}