document.addEventListener('DOMContentLoaded', function() {
let items = [];
let capacity = 15;
let currentStep = -1;
let executionSteps = [];
// DOM Elements
const capacityInput = document.getElementById('capacity');
const itemNameInput = document.getElementById('itemName');
const itemWeightInput = document.getElementById('itemWeight');
const itemValueInput = document.getElementById('itemValue');
const addItemBtn = document.getElementById('addItemBtn');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const resultTableBody = document.getElementById('resultTableBody');
const totalWeightEl = document.getElementById('totalWeight');
const totalValueEl = document.getElementById('totalValue');
const weightStatusEl = document.getElementById('weightStatus');
const itemsContainerEl = document.getElementById('itemsContainer');
// Update capacity when input changes
capacityInput.addEventListener('input', function() {
capacity = parseFloat(this.value) || 0;
updateWeightStatus();
});
// Add item button click handler
addItemBtn.addEventListener('click', function() {
const name = itemNameInput.value.trim();
const weight = parseFloat(itemWeightInput.value);
const value = parseFloat(itemValueInput.value);
if (!name || isNaN(weight) || isNaN(value) || weight <= 0 || value <= 0) {
alert('Please enter valid item details');
return;
}
const item = {
name,
weight,
value,
ratio: value / weight,
id: Date.now(),
color: getRandomColor()
};
items.push(item);
// Clear inputs
itemNameInput.value = '';
itemWeightInput.value = '';
itemValueInput.value = '';
// Update UI
updateItemsList();
itemNameInput.focus();
});
// Visualize button click handler
visualizeBtn.addEventListener('click', function() {
if (items.length === 0) {
alert('Please add at least one item');
return;
}
// Sort items by value-to-weight ratio (descending)
const sortedItems = [...items].sort((a, b) => b.ratio - a.ratio);
// Prepare execution steps
prepareExecutionSteps(sortedItems);
// Start visualization
currentStep = -1;
runVisualization();
});
// Reset button click handler
resetBtn.addEventListener('click', function() {
items = [];
executionSteps = [];
currentStep = -1;
updateItemsList();
updateResultTable();
updateContainerVisualization([]);
updateCodeHighlighting(-1);
itemsContainerEl.innerHTML = '';
weightStatusEl.textContent = `0/${capacity} kg`;
});
// Prepare execution steps for visualization
function prepareExecutionSteps(sortedItems) {
executionSteps = [];
let remainingCapacity = capacity;
let usedItems = [];
// Step 1: Sorting
executionSteps.push({
codeLineIndex: 0,
action: 'sort',
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Step 2: Initialize remaining capacity
executionSteps.push({
codeLineIndex: 1,
action: 'initialize',
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Process each item
for (let i = 0; i < sortedItems.length; i++) {
const item = sortedItems[i];
// Step 3: For loop iteration
executionSteps.push({
codeLineIndex: 2,
action: 'iteration',
currentItem: { ...item },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Step 4: Check if remaining capacity is 0
executionSteps.push({
codeLineIndex: 3,
action: 'check-capacity',
currentItem: { ...item },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
if (remainingCapacity <= 0) {
break;
}
// Step 5: Check if item fits completely
executionSteps.push({
codeLineIndex: 4,
action: 'check-fits',
currentItem: { ...item },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
if (item.weight <= remainingCapacity) {
// Step 6: Take item fully
const takenItem = {
...item,
fraction: 1,
weightUsed: item.weight,
valueAdded: item.value
};
usedItems.push(takenItem);
remainingCapacity -= item.weight;
executionSteps.push({
codeLineIndex: 5,
action: 'take-full',
currentItem: { ...item },
takenItem: { ...takenItem },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Step 7: Update remaining capacity
executionSteps.push({
codeLineIndex: 6,
action: 'update-capacity',
currentItem: { ...item },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
} else {
// Step 8: Calculate fraction
const fraction = remainingCapacity / item.weight;
executionSteps.push({
codeLineIndex: 8,
action: 'calculate-fraction',
currentItem: { ...item },
fraction,
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Step 9: Take fractional item
const takenItem = {
...item,
fraction,
weightUsed: remainingCapacity,
valueAdded: item.value * fraction
};
usedItems.push(takenItem);
executionSteps.push({
codeLineIndex: 9,
action: 'take-fraction',
currentItem: { ...item },
takenItem: { ...takenItem },
fraction,
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
// Step 10: Set remaining capacity to 0
remainingCapacity = 0;
executionSteps.push({
codeLineIndex: 10,
action: 'zero-capacity',
currentItem: { ...item },
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
}
}
// Final step
executionSteps.push({
codeLineIndex: 12,
action: 'complete',
items: sortedItems.map(item => ({ ...item })),
usedItems: [...usedItems],
remainingCapacity
});
}
// Run visualization step by step
function runVisualization() {
currentStep++;
if (currentStep >= executionSteps.length) {
return;
}
const step = executionSteps[currentStep];
// Update code highlighting
updateCodeHighlighting(step.codeLineIndex);
// Update container visualization
updateContainerVisualization(step.usedItems);
// Update result table
updateResultTable(step.usedItems);
// Update weight status
weightStatusEl.textContent = `${(capacity - step.remainingCapacity).toFixed(1)}/${capacity} kg`;
// Continue to next step after delay
setTimeout(runVisualization, 800);
}
// Update items list in the UI
function updateItemsList(sortByRatio = false) {
const addedItemsList = document.getElementById('addedItemsList');
const itemsGallery = document.getElementById('itemsGallery');
addedItemsList.innerHTML = '';
itemsGallery.innerHTML = '';
let displayItems = [...items];
if (sortByRatio) {
displayItems.sort((a, b) => b.ratio - a.ratio);
}
displayItems.forEach(item => {
// Create gallery item card
const itemCard = document.createElement('div');
itemCard.className = 'bg-white/80 rounded-lg p-4 shadow-sm border border-[#E4E9F2] flex flex-col relative overflow-hidden transition-all duration-300';
itemCard.style.transform = 'scale(1)';
itemCard.style.opacity = '1';
itemCard.style.borderLeftColor = item.color;
itemCard.style.borderLeftWidth = '4px';
// Add color accent background
const colorAccent = document.createElement('div');
colorAccent.className = 'absolute top-0 right-0 w-1/3 h-full opacity-10 -skew-x-12';
colorAccent.style.backgroundColor = item.color;
itemCard.appendChild(colorAccent);
const itemName = document.createElement('h3');
itemName.className = 'font-semibold text-[#6B7A99] mb-2 relative';
itemName.textContent = item.name;
const itemDetails = document.createElement('div');
itemDetails.className = 'flex flex-col gap-1 text-sm text-[#8193B2] relative';
const weightDiv = document.createElement('div');
weightDiv.className = 'flex items-center gap-2';
weightDiv.innerHTML = `<i class="ri-scales-3-line"></i> Weight: ${item.weight.toFixed(2)} kg`;
const valueDiv = document.createElement('div');
valueDiv.className = 'flex items-center gap-2';
valueDiv.innerHTML = `<i class="ri-money-dollar-circle-line"></i> Value: ${item.value.toFixed(2)}`;
const ratioDiv = document.createElement('div');
ratioDiv.className = 'flex items-center gap-2 mt-2 text-xs font-medium px-2 py-1 rounded-full w-fit';
ratioDiv.style.backgroundColor = item.color;
ratioDiv.style.color = '#6B7A99';
ratioDiv.innerHTML = `<i class="ri-bar-chart-line"></i> Value/Weight: ${item.ratio.toFixed(2)}`;
itemDetails.appendChild(weightDiv);
itemDetails.appendChild(valueDiv);
itemDetails.appendChild(ratioDiv);
itemCard.appendChild(itemName);
itemCard.appendChild(itemDetails);
itemsGallery.appendChild(itemCard);
const row = document.createElement('tr');
row.className = 'hover:bg-gray-50';
const nameCell = document.createElement('td');
nameCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
nameCell.textContent = item.name;
const weightCell = document.createElement('td');
weightCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
weightCell.textContent = item.weight.toFixed(2);
const valueCell = document.createElement('td');
valueCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
valueCell.textContent = item.value.toFixed(2);
const ratioCell = document.createElement('td');
ratioCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
ratioCell.textContent = item.ratio.toFixed(2);
row.appendChild(nameCell);
row.appendChild(weightCell);
row.appendChild(valueCell);
row.appendChild(ratioCell);
addedItemsList.appendChild(row);
});
updateResultTable();
updateWeightStatus();
}
// Update result table
function updateResultTable(usedItems = []) {
// Clear table except for the totals row
while (resultTableBody.firstChild) {
resultTableBody.removeChild(resultTableBody.firstChild);
}
let totalWeight = 0;
let totalValue = 0;
// Add used items to the table with animation
usedItems.forEach((item, index) => {
const row = document.createElement('tr');
row.className = 'hover:bg-gray-100 opacity-0';
row.style.transition = 'all 0.3s ease-in-out';
row.style.transform = 'translateY(-10px)';
const nameCell = document.createElement('td');
nameCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
nameCell.textContent = item.name;
row.appendChild(nameCell);
const fractionCell = document.createElement('td');
fractionCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
fractionCell.textContent = item.fraction.toFixed(2);
row.appendChild(fractionCell);
const weightCell = document.createElement('td');
weightCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
weightCell.textContent = item.weightUsed.toFixed(2);
row.appendChild(weightCell);
const valueCell = document.createElement('td');
valueCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
valueCell.textContent = item.valueAdded.toFixed(2);
row.appendChild(valueCell);
resultTableBody.appendChild(row);
totalWeight += item.weightUsed;
totalValue += item.valueAdded;
// Animate row entrance
setTimeout(() => {
row.style.opacity = '1';
row.style.transform = 'translateY(0)';
}, 50 * index);
});
// Add totals row with animation
const totalsRow = document.createElement('tr');
totalsRow.className = 'bg-[#F7F9FC] opacity-0';
totalsRow.style.transition = 'all 0.3s ease-in-out';
totalsRow.style.transform = 'translateY(-10px)';
const totalLabelCell = document.createElement('td');
totalLabelCell.className = 'border border-[#E4E9F2] px-4 py-2 font-medium text-[#6B7A99]';
totalLabelCell.colSpan = 2;
totalLabelCell.textContent = 'Totals';
totalsRow.appendChild(totalLabelCell);
const totalWeightCell = document.createElement('td');
totalWeightCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
totalWeightCell.id = 'totalWeight';
totalWeightCell.textContent = totalWeight.toFixed(2);
totalsRow.appendChild(totalWeightCell);
const totalValueCell = document.createElement('td');
totalValueCell.className = 'border border-[#E4E9F2] px-4 py-2 text-[#6B7A99]';
totalValueCell.id = 'totalValue';
totalValueCell.textContent = totalValue.toFixed(2);
totalsRow.appendChild(totalValueCell);
resultTableBody.appendChild(totalsRow);
// Animate totals row entrance
setTimeout(() => {
totalsRow.style.opacity = '1';
totalsRow.style.transform = 'translateY(0)';
}, 50 * (usedItems.length + 1));
// Update summary cards with animation
const summaryWeight = document.getElementById('summaryWeight');
const weightPercentage = document.getElementById('weightPercentage');
const summaryValue = document.getElementById('summaryValue');
const summaryItems = document.getElementById('summaryItems');
const itemsDetail = document.getElementById('itemsDetail');
// Animate number updates
animateNumber(summaryWeight, totalWeight, 'kg');
const percentageUsed = ((totalWeight / capacity) * 100).toFixed(1);
weightPercentage.textContent = `${percentageUsed}% of capacity`;
animateNumber(summaryValue, totalValue, '');
animateNumber(summaryItems, usedItems.length, '');
itemsDetail.textContent = usedItems.length === 0 ? 'No items selected' :
usedItems.length === 1 ? '1 item selected' :
`${usedItems.length} items selected`;
}
function animateNumber(element, target, suffix) {
const duration = 1000;
const start = parseFloat(element.textContent) || 0;
const startTime = performance.now();
function update() {
const currentTime = performance.now();
const progress = Math.min((currentTime - startTime) / duration, 1);
const currentValue = start + (target - start) * easeOutQuart(progress);
element.textContent = `${currentValue.toFixed(2)}${suffix ? ' ' + suffix : ''}`;
if (progress < 1) {
requestAnimationFrame(update);
}
}
function easeOutQuart(x) {
return 1 - Math.pow(1 - x, 4);
}
requestAnimationFrame(update);
}
// Update container visualization
function updateContainerVisualization(usedItems = []) {
itemsContainerEl.innerHTML = '';
if (usedItems.length === 0) {
return;
}
// Calculate total height of container
const containerHeight = itemsContainerEl.clientHeight;
// Sort items by ratio in descending order
const sortedItems = [...usedItems].sort((a, b) => b.ratio - a.ratio);
// Create items in container
sortedItems.forEach((item) => {
const itemEl = document.createElement('div');
itemEl.className = 'relative';
// Calculate height based on weight proportion
const heightPercent = (item.weightUsed / capacity) * 100;
itemEl.style.height = `${heightPercent}%`;
itemEl.style.backgroundColor = item.color;
// Add item label
const labelEl = document.createElement('div');
labelEl.className = 'absolute inset-0 flex items-center justify-center text-gray-600 font-medium text-sm';
labelEl.textContent = `${item.name} (${(item.fraction * 100).toFixed(0)}%)`;
itemEl.appendChild(labelEl);
itemsContainerEl.appendChild(itemEl);
});
}
// Update code highlighting
function updateCodeHighlighting(lineIndex) {
const codeViewer = document.getElementById('codeViewer');
const codeLines = [
'sorted = items.sort(by ratio desc);',
'rem = capacity;',
'for item of sorted {',
'  if rem <= 0 break;',
'  if item.weight <= rem {',
'    take item fully;',
'    rem -= item.weight;',
'  } else {',
'    fraction = rem / item.weight;',
'    take fraction of item;',
'    rem = 0;',
'  }',
'}'
];
let codeHtml = '';
codeLines.forEach((line, index) => {
if (index === lineIndex) {
codeHtml += `<div class="bg-blue-100 font-semibold">${line}</div>`;
} else {
codeHtml += `<div>${line}</div>`;
}
});
codeViewer.innerHTML = codeHtml;
}
// Update weight status
function updateWeightStatus() {
weightStatusEl.textContent = `0/${capacity} kg`;
}
// Helper function to generate random colors
function getRandomColor() {
const colors = [
'#F7CAC9', // dusty rose
'#92A8D1', // serenity blue
'#B5E7A0', // sage green
'#FFDAB9', // peach
'#D4B2D8', // lilac
'#98DBC6', // mint
'#E6E6FA', // lavender
'#FFE5B4', // pale peach
'#C5E0DC', // pale aqua
'#F8B195'  // coral
];
const color = colors[Math.floor(Math.random() * colors.length)];
return `${color}80`; // Adding 50% transparency
}
// Sort gallery button click handler
const sortGalleryBtn = document.getElementById('sortGalleryBtn');
let isSorted = false;
sortGalleryBtn.addEventListener('click', function() {
const itemCards = document.querySelectorAll('#itemsGallery > div');
isSorted = !isSorted;
// Update button text and icon
sortGalleryBtn.innerHTML = isSorted ?
'<i class="ri-sort-asc"></i> Original Order' :
'<i class="ri-sort-desc"></i> Sort by Value/Weight';
// Trigger animation
itemCards.forEach(card => {
card.style.transform = 'scale(0.8)';
card.style.opacity = '0.5';
});
setTimeout(() => {
updateItemsList(isSorted);
const newCards = document.querySelectorAll('#itemsGallery > div');
newCards.forEach(card => {
card.style.transform = 'scale(1)';
card.style.opacity = '1';
});
}, 300);
});
// Initialize
updateWeightStatus();
updateCodeHighlighting(-1);
});