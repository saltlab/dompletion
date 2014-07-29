Dompletion
=====

Dompletion assists developers by providing DOM-Aware JavaScript code completion, when the developer is writing JavaScript code to obtain references to DOM elements. Dompletion also analysis JavaScript code to reason about the existing as well as unseen DOM states.


## Paper

The technique behind Clematis is published as a research paper at ASE 2014. It is titled ["Dompletion: DOM-Aware JavaScript Code Completion"](http://salt.ece.ubc.ca/publications/kartik_ase14.html) and is available as a PDF.

## Using Dompletion

Currently, the Dompletion project is designed to run from within ["Brackets"](http://brackets.io/) IDE. 

### Installation

In terms of installation, setting up the project is easier than ever. Simply checkout the project from GitHub and import it into Brackets by placing the folder in the src/extensions/default/directory. Once you place the folder, reload brackets to enable the newly installed plugin.

### Configuration

Dompletion has been tested with the photo gallery application [Phormer](http://p.horm.org/er/) as well as the default web application included in Brackets. 


### Running the Tool 

In order to use the tool, please follow the following steps.

#### Enable ''Live Development'' in Brackets. 
#### Then click on the '''♂ Manual Record''' button to start capturing the DOM states. 
#### Navigate the web application to the required state.
#### Click '''◙ Stop Record''' button to the recording and start using the code completion feature.

## Contributing

Your feedback is valued! Please use the [Issue tracker](https://github.com/saltlab/dompletion/issues) for reporting bugs or feature requests.


