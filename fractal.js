import {defs, tiny} from './examples/common.js';

//import {widgets} from '../tiny-graphics-widgets.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Fractal extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube(),
            sphere4: new defs.Subdivision_Sphere(4)
        };

        this.materials = {
            gold: new Material(new defs.Textured_Reflected_Phong(),
                {ambient: 0.17375, diffusivity: 0.5282, specularity: 0.516716, smoothness: 51.2, color: hex_color("#D4AF37")}),
            silver: new Material(new defs.Textured_Reflected_Phong(),
                {ambient: 0.19225, diffusivity: 0.50754, specularity: 0.508273, smoothness: 51.2, color: hex_color("#C0C0C0")}),
            jade: new Material(new defs.Textured_Reflected_Phong(),
                {ambient: 0.17166, diffusivity: 0.68666, specularity: 0.316228, smoothness: 12.8, color: hex_color("#00A86B")}),
            ruby: new Material(new defs.Textured_Reflected_Phong(),
                {ambient: 0.066, diffusivity: 0.23232, specularity: 0.660576, smoothness: 76.8, color: hex_color("#E0115F")}),
            earthTop: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/py.png")}),
            earthBottom: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/ny.png")}),
            earthLeft: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/nx.png")}),
            earthRight: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/px.png")}),
            earthFront: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/pz.png")}),
            earthBack: new Material(new defs.Fake_Bump_Map(1),
                {ambient: 1.0, texture: new Texture("assets/nz.png")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 50), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Level 0", ["Control", "0"], () => this.attachedLevel = () => 0);
        this.key_triggered_button("Level 1", ["Control", "1"], () => this.attachedLevel = () => 1);
        this.key_triggered_button("Level 2", ["Control", "2"], () => this.attachedLevel = () => 2);
        this.key_triggered_button("Level 3", ["Control", "3"], () => this.attachedLevel = () => 3);
        this.key_triggered_button("Level 4", ["Control", "4"], () => this.attachedLevel = () => 4);
        this.key_triggered_button("Space environment", ["Control", "s"], () => this.attached = () => "space");
        this.key_triggered_button("Earth environment", ["Control", "e"], () => this.attached = () => "earth");
        
        this.key_triggered_button("Cube Fractal", ["Control", "c"], () => this.attachedShpe = () => 100);
        this.key_triggered_button("Pyramid Fractal", ["Control", "p"], () => this.attachedShpe = () => 101);

        this.key_triggered_button("Gold Color", ["Control", "g"], () => this.attachedColor = () => "gold");
        this.key_triggered_button("Silver Color", ["Control", "l"], () => this.attachedColor = () => "silver");
        this.key_triggered_button("Jade Color", ["Control", "j"], () => this.attachedColor = () => "jade");
        this.key_triggered_button("Ruby Color", ["Control", "r"], () => this.attachedColor = () => "ruby");
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


        if (this.attached !== undefined) {

            let envirmnt = this.attached();

            if (envirmnt == "earth") {

                const light_position = vec4(100, 100, 100, 1);
                program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

                let earthBackTransform = Mat4.identity()
                    .times(Mat4.translation(-250, 0, 0))
                    .times(Mat4.rotation(Math.PI * 0.5, 0, 1, 0))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthBackTransform, this.materials.earthBack);
                let earthFrontTransform = Mat4.identity()
                    .times(Mat4.translation(250, 0, 0))
                    .times(Mat4.rotation(Math.PI * -0.5, 0, 1, 0))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthFrontTransform, this.materials.earthFront);
                let earthLeftTransform = Mat4.identity()
                    .times(Mat4.translation(0, 0, -250))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthLeftTransform, this.materials.earthLeft);
                let earthRightTransform = Mat4.identity()
                    .times(Mat4.translation(0, 0, 250))
                    .times(Mat4.rotation(Math.PI, 0, 1, 0))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthRightTransform, this.materials.earthRight);
                let earthTopTransform = Mat4.identity()
                    .times(Mat4.rotation(Math.PI * 0.5, 0, 1, 0))
                    .times(Mat4.translation(0, 250, 0))
                    .times(Mat4.rotation(Math.PI * -0.5, 1, 0, 0))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthTopTransform, this.materials.earthTop);
                let earthBottomTransform = Mat4.identity()
                    .times(Mat4.rotation(Math.PI * 0.5, 0, 1, 0))
                    .times(Mat4.translation(0, -250, 0))
                    .times(Mat4.rotation(Math.PI * 0.5, 1, 0, 0))
                    .times(Mat4.scale(250, 250, 1));
                this.shapes.cube.draw(context, program_state, earthBottomTransform, this.materials.earthBottom);
            }
            else if (envirmnt == "space") {
                program_state.set_camera(this.initial_camera_location)
            }
        }

        const light_position = vec4(11, 11, 11, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        let pickedMaterial = this.materials.ruby;
        if(this.attachedColor) {
			if (this.attachedColor() == "jade") { // color------------------------------------------------------------------------------------
	            pickedMaterial = this.materials.jade;
			} else if (this.attachedColor() == "silver") {
	            pickedMaterial = this.materials.silver;
			} else if (this.attachedColor() == "gold") {
	            pickedMaterial = this.materials.gold;
			} else if (this.attachedColor() == "ruby") {
	            pickedMaterial = this.materials.ruby;
			} else if (this.attachedColor === undefined) {
	            pickedMaterial = this.materials.ruby;
			}
		}

        var level;
        var width = 10;
        if (this.attachedLevel === undefined) {
            level = 0;
        } else {
            level = this.attachedLevel();
        }
		
		
		if ((this.attachedShpe == 100) || (this.attachedShpe === undefined)) { // cube-----------------------------------------------------------------
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
				this.shapes.cube.draw(context, program_state, cube_transform.times(Mat4.rotation(0.4 * Math.PI * t, 1, 1, 0)).times(Mat4.translation(boxes[i].pos[0], boxes[i].pos[1], boxes[i].pos[2])).times(Mat4.scale(boxes[i].r, boxes[i].r, boxes[i].r)), pickedMaterial);
			}
		}
		else if (this.attachedShpe == 101) { // pyramid----------------------------------------------------------------------------------------
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
