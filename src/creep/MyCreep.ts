export default class MyCreep {
  protected creep;
  constructor(creep: Creep) {
    this.creep = creep;
  }
  public loop() {}

  protected getStructuresNeedingEnergy() {
    return this.creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
  }

  protected getNearestStructure(structures: AnyStructure[]): AnyStructure | null {
    let nearestStructure = structures[0];
    let nearestDistance = this.creep.pos.getRangeTo(nearestStructure);

    for (let i = 1; i < structures.length; i++) {
      const currentDistance = this.creep.pos.getRangeTo(structures[i]);
      if (currentDistance < nearestDistance) {
        nearestStructure = structures[i];
        nearestDistance = currentDistance;
      }
    }

    return nearestStructure;
  }

  protected storeEnergyInStructure() {
    this.creep.memory.harvestingIn = undefined;
    let structures = this.getStructuresNeedingEnergy();
    if (structures.length > 0) {
      if (this.creep.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }

  protected upgrade() {
    const creep = this.creep;
    if (creep.room.controller && creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  protected lookForEnergy() {
    const container = this.getNearestNotEmptyContainer();
    if (this.creep.memory.dndTimer !== undefined) {
      this.creep.say("dnd" + this.creep.memory.dndTimer);
      this.creep.moveTo(Game.flags["dnd"], { visualizePathStyle: { stroke: "#ffffff" } });
      this.creep.memory.dndTimer -= 1;
      if (this.creep.memory.dndTimer <= 0) {
        this.creep.memory.dndTimer = undefined;
      }
      return;
    }

    if (container) {
      console.log("container found", container.store.energy);
      const result = this.creep.withdraw(container, RESOURCE_ENERGY);
      if (result === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else {
      console.log("not container found");
      this.creep.say("dnd");
      this.creep.memory.dndTimer = 50;
    }
  }

  protected getNearestNotEmptyContainer(): StructureContainer {
    let structures = this.creep.room.find<StructureContainer>(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType === STRUCTURE_CONTAINER && structure.store.energy > this.creep.store.getCapacity()
        );
      }
    });

    structures.sort((structureA, structureB) => {
      const distanceA = this.creep.pos.getRangeTo(structureA);
      const distanceB = this.creep.pos.getRangeTo(structureB);
      return distanceA - distanceB;
    });

    return structures[0];
  }

  protected harvest() {
    // console.log("harvest()");

    const source = this.getSourceToHarvest();

    if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }

  protected getSourceToHarvest(): Source {
    const harvestingId = this.creep.memory.harvestingIn;
    const isAlreadyHarvesting = harvestingId !== undefined;
    return isAlreadyHarvesting
      ? this.creep.room.find(FIND_SOURCES, { filter: source => source.id === harvestingId })[0]
      : this.decideNextHarvestSource();
  }

  protected decideNextHarvestSource(): Source {
    const sources = this.creep.room.find(FIND_SOURCES);
    const creeps = Object.values(Game.creeps);
    const harvesterCountBySourceId: { [sourceId: string]: number } = {};
    for (const source of sources) {
      harvesterCountBySourceId[source.id] = 0;
    }
    for (const creep of creeps) {
      if (creep.memory.harvestingIn !== undefined) harvesterCountBySourceId[creep.memory.harvestingIn] += 1;
    }
    let bestQ = 1000;
    let bestSourceId = "";
    for (const [sourceId, q] of Object.entries(harvesterCountBySourceId)) {
      if (q < bestQ) {
        bestQ = q;
        bestSourceId = sourceId;
      }
    }
    const nextSource = sources.find(s => s.id === bestSourceId);
    if (!nextSource) throw new Error("source not found");

    this.creep.memory.harvestingIn = nextSource.id;

    return nextSource;
  }

  protected build() {
    const targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);

    if (targets.length) {
      const closestTarget = _.min(targets, target => this.creep.pos.getRangeTo(target));
      if (this.creep.build(closestTarget) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(closestTarget, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }
}
