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

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 400), vec3(0, 0, 0), vec3(0, 1, 0));
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
        var width = 60;
        if (this.attached === undefined) {
            level = 0;
        } else {
            level = this.attached();
        }
        level += 1;
        let cube_transform = Mat4.identity();
        // this.shapes.cube.draw(context, program_state, cube_transform.times(Mat4.scale(width, width, width)).times(Mat4.translation(width*2, width*2, width*2)), this.materials.test);
        // this.shapes.cube.draw(context, program_state, cube_transform, this.materials.test);
        this.mengerCube(context, program_state, cube_transform,  -width, -width, -width, width, 0, level);
    }




    /**
     * @param context
     * @param program_state
     * @param cube_transform
     * @param x     - starting x pixel index of the sponge
     * @param y     - starting y pixel index of the sponge
     * @param z     - starting z pixel index of the sponge
     * @param width - width of the cube to be added
     * @param current
     * @param level
     */

    mengerCube(context, program_state, cube_transform, x, y, z, width, current, level) {
        if (level < 0) {
            return;
        } else if (level == 0) {
            this.drawCube(context, program_state, cube_transform, 0, 0, 0, x, y, z, 3 * width);
            return;
        }

        for (var i = 0; i <= 2; i++) {
            for (var j = 0; j <= 2; j++) {
                for (var k = 0; k <=2; k++) {
                    var num = 0;
                    if (i==1) num++;
                    if (j==1) num++;
                    if (k==1) num++;


                    if (num < 2) {
                        if (current < level-1) {
                            this.mengerCube(context, program_state, cube_transform, (x + i * width), (y + j * width), (z + k * width), width/3, current + 1, level);
                        } else if (current == level-1) {
                            this.drawCube(context, program_state, cube_transform, i, j, k, x, y, z, width);
                        }
                    }
                }
            }
        }
    }

    /**
     * @param context
     * @param program_state
     * @param cube_transform
     * @param i     - x index out of 2 of the cubes in the sponge
     * @param j     - y index out of 2 of the cubes in the sponge
     * @param k     - z index out of 2 of the cubes in the sponge
     * @param x     - starting x pixel index of the sponge
     * @param y     - starting y pixel index of the sponge
     * @param z     - starting z pixel index of the sponge
     * @param width - width of the cube to be added
     */

    drawCube(context, program_state, cube_transform, i, j, k, x, y, z, width)
    {
        // Set the position of the cube

        cube_transform = cube_transform.times(Mat4.translation(x + (i)*width/2, y + (j)*width/2, z + (k)*width/2));
        cube_transform = cube_transform.times(Mat4.scale(width, width, width));

        this.shapes.cube.draw(context, program_state, cube_transform, this.materials.test);
    }
}


