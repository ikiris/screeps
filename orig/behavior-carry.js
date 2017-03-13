let behaviorFind = require('behavior-find');
let behaviorFeed = require('behavior-find');

module.exports = {
    run: function(creep) {
        if (creep.carry.energy == 0) {
            creep.addOverride("find")
            behaviorFind.run(creep);
            return;
        }
        creep.addOverride("feed");
        behaviorFeed.run(creep);
        return;
    }
};
