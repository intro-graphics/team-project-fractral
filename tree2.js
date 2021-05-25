import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

let PI = Math.PI;
let lengths = [];
let XYangles = [0];
let YZangles = [0];
let XY_prev_angles = [0];
let YZ_prev_angles = [0];
// let num_branches = [1];
let total_num_branches = 0;
let depth = getRandomInt(4, 7);
let branch_iter = 1;
let level_iter = 1;
let count = 0;
let num_branches = 0;


for (let i = 0; i < depth; i++) {
    num_branches = num_branches + 2 ** i;
}

for (let i = 0; i < num_branches; i++) {
    lengths.push(getRandomInt(2, 6));
    if (i == 0) {
        continue;
    }

    if(i % 2 == 1) {
        let tempXY = XY_prev_angles[0] + PI/getRandomInt(4,9);
        let tempYZ = YZ_prev_angles[0] + PI/getRandomInt(4,9);
        XYangles.push(tempXY);
        YZangles.push(tempYZ);
        XY_prev_angles.push(tempXY);
        YZ_prev_angles.push(tempYZ);
        count += 1;
    } else {
        let tempXY = XY_prev_angles[0] - PI/getRandomInt(4,9);
        let tempYZ = YZ_prev_angles[0] - PI/getRandomInt(4,9);
        XYangles.push(tempXY);
        YZangles.push(tempYZ);
        XY_prev_angles.push(tempXY);
        YZ_prev_angles.push(tempYZ);
        count += 1;
    }
    if (count == 2) {
        count = 0;
        XY_prev_angles.shift();
        YZ_prev_angles.shift();
    }
}


export class Tree2 extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube(),
            plane: new defs.Square(),
        };


        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#53350A")}),

            soil: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#836539")}),
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 60), vec3(0, 10, 0), vec3(0, 1, 0));
    }

    make_control_panel() {

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

        const t = program_state.animation_time, dt = program_state.animation_delta_time / 1000;

        let identity = Mat4.identity();

        let locations = [vec3(0,lengths[0],0)];
        let endpoints = [vec3(0, 2*lengths[0], 0)];

        let count = 0;
        for (let i = 1; i < num_branches+1; i++) {
            locations.push(vec3(endpoints[0][0] - lengths[i] * Math.sin(XYangles[i]), endpoints[0][1] + lengths[i] * Math.cos(XYangles[i]),0))
            endpoints.push(vec3(endpoints[0][0] - 2*lengths[i] * Math.sin(XYangles[i]), endpoints[0][1] + 2*lengths[i] * Math.cos(XYangles[i]),0))

            let length = Math.sqrt(lengths[i]);
            // locations.push(vec3(endpoints[0][0] - length * Math.sin(XYangles[i]) + length * Math.cos(YZangles[i]), endpoints[0][1] + length * Math.cos(XYangles[i]), endpoints[0][2]-length * Math.sin(YZangles[i])))
            // endpoints.push(vec3(endpoints[0][0] - 2*length * Math.sin(XYangles[i]) + 2*length * Math.cos(YZangles[i]), endpoints[0][1] + 2*length * Math.cos(XYangles[i]), endpoints[0][2]-2*length * Math.sin(YZangles[i])))

            count++;

            if(count == 2) {
                endpoints.shift();
                count = 0;
            }
        }


        // let iter = 1;
        // for (let i = 0; i < depth;  i++) {
        //     for(let j = 0; j < 1; j++) {
        //         locations.push(vec3(endpoints[0][0] - lengths[iter]*Math.sin(angles[iter]), endpoints[0][1] + lengths[iter] * Math.cos(angles[iter]),0))
        //         endpoints.push(vec3(2 * locations[iter][0], 2 * locations[iter][1], locations[iter][2]))
        //         iter++;
        //     }
        //     endpoints.shift();
        // }


        for(let i = 0; i < num_branches; i++) {
            let transform = identity.times(Mat4.translation(locations[i][0], locations[i][1], locations[i][2])).times(Mat4.rotation(XYangles[i], 0,0,1))
                // .times(Mat4.rotation(YZangles[i], 0, 1, 0))
                .times(Mat4.scale(1, lengths[i], 1));

            this.shapes.cube.draw(context, program_state, transform, this.materials.test)
        }

    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}
