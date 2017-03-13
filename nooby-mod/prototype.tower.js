// create a new function for StructureTower
StructureTower.prototype.run =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined) {
            this.room.memory.war = true
            this.room.memory.hostile = Game.tick
            // ...FIRE!
            this.attack(target);
            return;
        } else {
            if (this.room.memory.hostile < Game.tick) - 300
            this.room.memory.war = false
        }

            let prioritysites;
            let constructionSite;
            let structures = this.room.find(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.hits < (this.room.memory.war == true ? 30000 : 3000)});
            priorityTypeList = [
                STRUCTURE_RAMPART,
                STRUCTURE_WALL,
            ];
            for (let st of priorityTypeList) {
                prioritysites = _(structures).filter(function(s) {
                    return _.includes(st, s.structureType)
                }).valueOf();
                if (prioritysites.length > 0) {
                    //console.log("tower pri " + prioritysites.length)
                    break;
                }
            }
            if (prioritysites.length > 0) {
                let avg = _(prioritysites).sum(function(s) {
                    return s.hits;
                }) / prioritysites.length;
                    //console.log("tower avg " + avg)
                let lowsites = _(prioritysites).filter(function(s) {
                    return s.hits < avg
                }).valueOf();
                    //console.log("tower lowsites " + lowsites.length)
                if (lowsites.length > 0) {
                    prioritysites = lowsites;
                }
            }
            if (prioritysites.length > 0) {
                constructionSite = this.pos.findClosestByRange(prioritysites);
            }
            if (constructionSite == undefined) {
                constructionSite = this.pos.findClosestByRange(structures);
            }
            // if one is found
            if (constructionSite != undefined) {
                //creep.say(constructionSite.structureType);
                // try to build, if the constructionSite is not in range
                this.repair(constructionSite);
                return;
            }
    };
