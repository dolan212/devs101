import {
    Node
} from '@/tree'

export class Rule {
    constructor(id) {
        this.id = id;
        this.type = "null";
    }
}

export class DependencyRule extends Rule {
    constructor(id, node) {
        super(id);
        this.node = node;
        this.type = "dependency";
    }
}

export class LevelRule extends Rule {
    constructor(id, level) {
        super(id);
        this.level = level;
        this.type = "level";
    }
}

export class SkillPointRule extends Rule {
    constructor(id, skillpoints) {
        super(id);
        this.skillpoints = skillpoints;
        this.type = "skillpoint";
    }
}
