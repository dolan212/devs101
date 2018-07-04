import {Node} from '@/tree'

export class Rule {
    constructor(id) {
        this.id = id;
    }
}

export class DependencyRule extends Rule {
    constructor(id, node) {
        super(id);
        this.node = node;
    }
}

export class LevelRule extends Rule {
    constructor(id, level) {
        super(id);
        this.level = level;
    }
}

export class SkillPointRule extends Rule {
    constructor(id, skillpoints) {
        super(id);
        this.skillpoints = skillpoints;
    }
}
