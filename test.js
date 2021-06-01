import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Test extends Scene {
    constructor() {
        // Constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.shapes = {
            cube: new defs.Cube(),
            plane: new defs.Square(),
        };


        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#cdcd23")}),

            soil: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color:hex_color("#836539")}),
        };

        this.initial_camera_location = Mat4.look_at(vec3(-30, 5, -30), vec3(30, 0, 30), vec3(0, 1, 0));
        this.animation_queue = [];
		this.set_position();
    }

	set_position() {
		this.rand1 = [];
		this.rand2 = [];
		this.rand1.push(Math.random()*50 - 25);
		this.rand2.push(Math.random()*50 - 25);
	}
	
    make_control_panel() {

    }

    my_mouse_down_test(e, pos, context, program_state) {

    }

    my_mouse_down(e, pos, context, program_state) {

        let pos_ndc_near = vec4(pos[0], pos[1], -1.0, 1.0);
        let pos_ndc_far = vec4(pos[0], pos[1], 1.0, 1.0);
        let pos_ndc_mid = vec4(pos[0], pos[1], 0.0, 1.0);
        let center_ndc_near = vec4(0,0, 0,0, -1.0, 1.0);
        let P = program_state.projection_transform;
        let V = program_state.camera_inverse;

        let pos_world_near = Mat4.inverse(P.times(V)).times(pos_ndc_near);
        let pos_world_far = Mat4.inverse(P.times(V)).times(pos_ndc_far);
        let pos_world_mid = Mat4.inverse(P.times(V)).times(pos_ndc_mid);
        let center_world_near = Mat4.inverse(P.times(V)).times(center_ndc_near);

        pos_world_near.scale_by(1 / pos_world_near[3]);
        pos_world_far.scale_by(1 / pos_world_far[3]);
        pos_world_mid.scale_by(1 / pos_world_mid[3]);
        center_ndc_near.scale_by(1 / center_world_near[3]);


        let animation_bullet = {
            loc: pos_world_near,
            from: center_world_near,
            to: pos_world_far,
            mid: pos_world_mid,
            start_time: program_state.animation_time,
            end_time: program_state.animation_time + 15000,
            more_info: "add gravity"
        }

        this.animation_queue.push(animation_bullet)
    }


    display(context, program_state) {
        // display(): Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            program_state.set_camera(this.initial_camera_location)

            let canvas = context.canvas;
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec((e.clientX - (rect.left + rect.right) / 2) / ((rect.right - rect.left) / 2),
                    (e.clientY - (rect.bottom + rect.top) / 2) / ((rect.top - rect.bottom) / 2));

            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.my_mouse_down(e, mouse_position(e), context, program_state);
				this.set_position()
            });
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time, dt = program_state.animation_delta_time / 1000;

        let origin = Mat4.identity();
        origin = origin.times(Mat4.translation(0, 0, 0))
            .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.scale(30, 30, 30));

        this.shapes.plane.draw(context, program_state, origin, this.materials.soil);
		
        console.log("here");
        if (this.animation_queue.length > 0) {
            console.log(this.animation_queue.length);
            for (let i = 0; i < this.animation_queue.length; i++) {
                let animation_bullet = this.animation_queue[i];

                let loc = animation_bullet.loc;
                let from = animation_bullet.from;
                let to = animation_bullet.to;
                let mid = animation_bullet.mid;
                let start_time = animation_bullet.start_time;
                let end_time = animation_bullet.end_time;
				
                if (t <= end_time && t >= start_time) {
                    let animation_process = (t - start_time) / (end_time - start_time);
                    let position = to.times(animation_process).plus(from.times(1 - animation_process));

                    //if (animation_bullet.more_info === "add gravity") {
                    //    position[1] -= 0.5 * 9.8 * ((t - start_time) / 1000) ** 2;
                    //}

                    //let tree_test = Mat4.identity();
					//tree_test = Mat4.translation(to[0], to[1], to[2]);
                    //this.shapes.cube.draw(context, program_state, tree_test, this.materials.test);

                    //let model_trans = ((Mat4.identity()).times(Mat4.translation(position[0], position[1], position[2])))
                    //    .times(Mat4.rotation(animation_process * 50, .3, .6, .2))
					
					let t_int = Math.floor(t);
					let model_trans = (Mat4.identity()).times(Mat4.translation(this.rand1[t_int % this.rand1.length], 0, this.rand2[t_int % this.rand2.length])).times(Mat4.translation(0, 1, 0));

                    //this.shapes.cube.draw(context, program_state, origin.times(Mat4.scale(0.03, 0.03, 0.03)), this.materials.test);
					this.shapes.cube.draw(context, program_state, model_trans, this.materials.test);
                }
            }
        }

        while (this.animation_queue.length > 0) {
            if (t > this.animation_queue[0].end_time) {
                this.animation_queue.shift();
            } else {
                break;
            }
        }
    }
}




