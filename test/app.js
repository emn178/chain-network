(function ($) {
  $(document).ready(function () {
    $('#network').chainNetwork({
      vis: {
        groups: {
          project: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf004',
              size: 30,
              color: 'red'
            }
          },
          vendor: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf19c',
              size: 30,
              color: '#752ab9'
            }
          },
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
      project: {
        id: 'project_25',
        label: 'This Project',
        target: 50000,
        tooltipTemplate: 'Target: {target}<br/>Current: {incomingValue}({incomingPercentage}%)<br/>Used: {outgoingValue}({outgoingPercentage}%)'
      },
      nodes: [
        { id: 'user_5', label: 'takasaky', group: 'user' },
        { id: 'user_6', label: 'tester', group: 'user' },
        { id: 'user_4', label: 'will', group: 'user' },
        { id: 'user_7', label: 'user7', group: 'user' },
        { id: 'user_8', label: 'user8', group: 'user' },
        { id: 'user_9', label: 'user9', group: 'user' },
        { id: 'user_10', label: 'user10', group: 'user' },
        { id: 'user_11', label: 'user11', group: 'user' },
        { id: 'user_12', label: 'user12', group: 'user' },
        { id: 'user_13', label: 'user13', group: 'user' },
        { id: 'user_14', label: 'user14', group: 'user' },
        { id: 'user_15', label: 'user15', group: 'user' },
        { id: 'user_16', label: 'user16', group: 'user' },
        { id: 'project_2', label: 'Project 2', group: 'project' },
        { id: 'vendor_1', label: 'Vendor 1', group: 'vendor' }
      ],
      transcations: [
        { id: 'TID01', from: 'user_5', to: 'project_25', value: 3456 },
        { id: 'TID02', from: 'user_6', to: 'project_25', value: 123 },
        { id: 'TID03', from: 'project_25', to: 'user_4', value: 456 },
        { id: 'TID04', from: 'project_25', to: 'user_6', value: 123 },
        { id: 'TID05', from: 'user_7', to: 'project_25', value: 800 },
        { id: 'TID06', from: 'user_8', to: 'project_25', value: 500 },
        { id: 'TID07', from: 'user_9', to: 'project_25', value: 1000 },
        { id: 'TID08', from: 'user_10', to: 'project_25', value: 1200 },
        { id: 'TID09', from: 'user_11', to: 'project_25', value: 300 },
        { id: 'TID10', from: 'user_12', to: 'project_25', value: 600 },
        { id: 'TID11', from: 'project_25', to: 'user_13', value: 1000 },
        { id: 'TID12', from: 'project_25', to: 'user_14', value: 1000 },
        { id: 'TID13', from: 'project_25', to: 'user_15', value: 1000 },
        { id: 'TID14', from: 'project_25', to: 'user_16', value: 1000 },
        { id: 'TID15', from: 'project_25', to: 'project_2', value: 100 },
        { id: 'TID16', from: 'project_25', to: 'vendor_1', value: 500 }
      ]
    }).on('chain:transcation', function (e, transcation) {
      console.log(transcation);
    }).on('chain:node', function (e, node) {
      console.log(node);
    });
  });
})(jQuery);
