define([],function(IPython, dialog, $, mc){

    // we will define an action here that should happen when we ask to clear and restart the kernel.
    var dm_version  = {
        help: 'Version dataset with Dotmesh',
        icon : 'fa-github',
        help_index : '',
        handler : function (env) {
        }
    }

    function _on_load(){

        // log to console
        console.info('Loaded Jupyter extension: Dotmesh')

        // register new action
        var action_name = IPython.keyboard_manager.actions.register(dm_version, 'version', 'dm')

        // add button for new action
        IPython.toolbar.add_buttons_group(['dm.version'])

    }

    return {load_ipython_extension: _on_load };
})