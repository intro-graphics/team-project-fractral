import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Fractal extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube()
        };

        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#cdcd23")})
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 50), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Level 0", ["Control", "0"], () => this.attached = () => 0);
        this.key_triggered_button("Level 1", ["Control", "1"], () => this.attached = () => 1);
        this.key_triggered_button("Level 2", ["Control", "2"], () => this.attached = () => 2);
        this.key_triggered_button("Level 3", ["Control", "3"], () => this.attached = () => 3);
        this.key_triggered_button("Level 4", ["Control", "4"], () => this.attached = () => 4);
    }

    display(context, program_state) {
        // display(): Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            program_state.set_camera(this.initial_camera_location)
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        var level;
        var width = 10;
        if (this.attached === undefined) {
            level = 0;
        } else {
            level = this.attached();
        }
        let cube_transform = Mat4.identity();

        var boxes = [];
        var b = new Box(0, 0, 0, width);
        boxes.push(b);

        if (level !== 0) {
            for (var i = 0; i < level; i++) {
                var next = [];
                for (var j = 0; j < boxes.length; j++) {
                    var b = boxes[j];
                    var new_boxes = b.generate();
                    next = next.concat(new_boxes);
                }
                boxes = next;
            }
        }

        for (var i = 0; i < boxes.length; i++) {
            this.shapes.cube.draw(context, program_state, cube_transform.times(Mat4.translation(boxes[i].pos[0], boxes[i].pos[1], boxes[i].pos[2])).times(Mat4.scale(boxes[i].r, boxes[i].r, boxes[i].r)), this.materials.test);
        }
    }
}

function Box(x, y, z, r) {
    this.pos = vec3(x, y, z);
    this.r = r;

    this.generate = function() {
        let boxes = [];
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                for (let z = -1; z < 2; z++) {
                    let sum = Math.abs(x) + Math.abs(y) + Math.abs(z);
                    let newR = r / 3;

                    if (sum > 1) {
                        let b = new Box(this.pos[0] + x * newR*2, this.pos[1] + y * newR*2, this.pos[2] + z * newR*2, newR);
                        boxes.push(b)
                    }
                }
            }
        }
        return boxes;
    };
}


