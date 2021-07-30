let fs = require('fs')
//change this depending on your device and what binding you have installed
let tf = require('@tensorflow/tfjs-node-gpu')

//number of days to be considered
const DAYS = 31;
//possible classifications
const LABELS = ['uniform', 'weekends', 'sinusoidal', 'linear']

let data = loadData('tallies.json')

let inputs = []
let labels = []

tf.util.shuffle(data)

for (tally of data) {
    let count = countPerDay(tally.tally)

    //normalize tally count to range [0, 1]
    max = count.map(c => c.count).reduce((a, b) => Math.max(a, b))
    inputs.push(count.map(count => count.count / max))

    labels.push(LABELS.indexOf(tally.label))
}

const model = tf.sequential();

model.add(tf.layers.dense({ units: 250, activation: 'relu', inputShape: [DAYS] }))
model.add(tf.layers.dense({ units: 200, activation: 'relu' }));
model.add(tf.layers.dense({ units: 150, activation: 'relu' }));
model.add(tf.layers.dense({ units: 100, activation: 'relu' }));
model.add(tf.layers.dense({ units: LABELS.length, activation: 'softmax' }))

model.compile({
    optimizer: tf.train.adam(),
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
})

const inputTensor = tf.tensor2d(inputs.flat(), [inputs.length, DAYS])
const labelTensor = tf.tensor2d(labels, [labels.length, 1])

train(model, inputTensor, labelTensor).then(() => {
    //demonstrate on a different example data set
    let testData = loadData('test.json')
    for (tally of testData) {
        let count = countPerDay(tally.tally).map(c => c.count)
        let max = count.reduce((a, b) => Math.max(a, b))
        console.log(count)
        console.log(`Label: ${tally.label}`)
        model.predict(tf.tensor(count.map(c => c / max), [1, count.length])).print()
    }

})

async function train(model, inputs, labels) {
    await model.fit(
        inputs,
        labels,
        { epochs: 100 })
    await model.save("file:///Coding/tf-tut/trainer/model2")
}

function loadData(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function countPerDay(data) {
    let numberPerDay = new Array(DAYS);

    for (let i = 0; i < numberPerDay.length; i++) {
        numberPerDay[i] = { "day": dayToWeekday(i) + "", "count": 0 }
    }

    data.forEach(tally => { numberPerDay[new Date(tally._startDate).getDate() - 1].count++; })

    return numberPerDay;
}

function dayToWeekday(day) {
    const weekdays = ["Su", "M", "T", "W", "Th", "F", "Sa"]

    return weekdays[day % 7]
}