# Correlator Pattern Matching

A collection of tools to generate training data and train neural networks to analyze tally data in tallylab.

## Usage
To generate and label data open `index.html` in the web browser of your choice. Generating over 25,000 tallies may prevent the download feature from working.

The format of the download is:
```json
[
    {
        label: "uniform"|"linear"|"weekends"|"sinusoidal",
        tally: [Tally*]
    }*
]
```
Where `Tally` has all the fields of a Tallylab Tally object.