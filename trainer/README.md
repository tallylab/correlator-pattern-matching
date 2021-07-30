# Trainer

Small script to train and save a tensorflow model to classify tallylab tallies.

## Install
The dependencies can be installed using `npm install`.
Depending on the device you are using, you may need to change which version of tensorflow you are using (ie. `@tensorflow/tfjs-node-gpu`, `@tensorflow/tfjs-node`, or `@tensorflow/tfjs`) and install the appropriate c++ bindings.

## Usage
To use you need to supply a file of labeled tallied called `tallies.json`. The format is the same as that outputed by the generator. You also need to supply a file of test tallies called `test.json`. Afterwards, run with the command `node index`.