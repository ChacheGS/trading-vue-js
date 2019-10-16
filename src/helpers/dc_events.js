
// DataCube event handlers

import Utils from '../stuff/utils.js'
import Icons from '../stuff/icons.json'

export default class DCEvents {

    // Called when overalay/tv emits 'custom-event'
    on_custom_event(event, args) {
        switch(event) {
            case 'register-tools': this.register_tools(args)
                break
            case 'tool-selected':
                this.tv.$set(this.data, 'tool', args[0])
                if (args[0] === 'Cursor') {
                    this.tv.$set(this.data, 'drawingMode', false)
                }
                break
            case 'drawing-mode-on':
                if (this.data.tool !== 'Cursor' &&
                   !this.data.drawingMode) {
                    this.tv.$set(this.data, 'drawingMode', true)
                    this.build_tool(args[0])
                }
                break
            case 'drawing-mode-off':
                this.tv.$set(this.data, 'drawingMode', false)
                this.tv.$set(this.data, 'tool', 'Cursor')
                break
            default: console.log(event, args)
                break
        }
    }

    // Combine all tools and their mods
    register_tools(tools) {

        //TODO: merging with user-defined toolset
        if (this.data.tools) return
        let list = [{
            type: 'Cursor', icon: Icons['cursor.png']
        }]

        for (var tool of tools) {
            var proto = Object.assign({}, tool.info)
            proto.type = `${tool.use_for}:${tool.info.type}`
            delete proto.mods
            list.push(proto)
            for (var mod in tool.info.mods) {
                var mp = Object.assign({}, proto)
                mp = Object.assign(mp, tool.info.mods[mod])
                mp.type = `${tool.use_for}:${mod}`
                list.push(mp)
            }
        }

        this.tv.$set(this.data, 'tools', list)
        this.tv.$set(this.data, 'tool', 'Cursor')

    }

    // Place a
    build_tool(grid_id) {
        // TODO: Tools for offchart grids (grid_id > 0).
        // Currently 1 offchart overlay === 1 new grid,
        // need to find a way to stack offchart overlays.
        if (grid_id !== 0) return

        let list = this.data.tools
        let type = this.data.tool
        let proto = list.find(x => x.type === type)
        if (!proto) return

        let sett = Object.assign({}, proto.settings || {})
        let data = (proto.data || []).slice()

        if(!('legend' in sett)) sett.legend = false

        this.add('onchart', {
            name: proto.name,
            type: type.split(':')[0],
            settings: sett,
            data: data
        })

    }
}