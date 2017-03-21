# Chain Network
Vis wrapper for ChainChain network.

## Demo
[Demo](https://emn178.github.io/chain-network/samples/demo/)

## Download
[Compress](https://raw.github.com/emn178/chain-network/master/build/chain-network.min.js)  
[Uncompress](https://raw.github.com/emn178/chain-network/master/src/chain-network.js)

## Usage
```JavaScript
$('#network').chainNetwork(options);
```

### Options
```JavaScript
{
  // any options want to give vis.Network instance
  vis: {
    // example, set up icons
    groups: {
      user: {
        shape: 'icon',
        icon: {
          face: 'FontAwesome',
          code: '\uf007',
          size: 30
        }
      },
      page: {
        shape: 'icon',
        icon: {
          face: 'FontAwesome',
          code: '\uf0c0',
          size: 30,
          color: '#fd6705'
        }
      }
    }
  },

  // how many nodes per page
  pageSize: 10,

  // color of incoming edge
  incomingEdgeColor: '#02c66c',

  // color of outgoing edge
  outgoingEdgeColor: '#ff0000',

  project: {
    // project id
    id: 'project_25',

    // target amount of this project
    target: 50000,

    // tooltip template
    tooltipTemplate: 'Target: {target}<br/>Current: {incomingValue}({incomingPercentage}%)<br/>Used: {outgoingValue}({outgoingPercentage}%)'
  },
  nodes: [
    { id: 'user_5', label: 'takasaky', group: 'user' },
    { id: 'user_4', label: 'will', group: 'user' }
  ],
  transcations: [
    { id: 'TID01', from: 'user_5', to: 'project_25', value: 3456 },
    { id: 'TID03', from: 'project_25', to: 'user_4', value: 456 },
  ]
}
```

## Contact
The project's website is located at https://github.com/emn178/chain-network  
Author: Chen, Yi-Cyuan (emn178@gmail.com)
