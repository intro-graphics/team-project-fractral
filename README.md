# Factral Structure

## Contributors
- Ryan Han: https://github.com/RyanHan0127
- Euibin Kim: https://github.com/EuibinK
- Jinbean Park: https://github.com/JinbeanPark
- Nathan Chen: https://github.com/nathanachen

## Factral.js

This file demonstrates what a typical factral structure is. We implemented a Menger sponge and a pyramid struture. Users can select different levels of the structure, which essentially means how many recursions you want to apply on the structure. As of now, we have 5 levels avaliable, including the 0th base level. Users can also select different backgrounds, which is a sphere mapping texture background. User can also select different colors. Both of our structures are using a reflection phong shader, which was implemented in GLSL. We use sphere mapping to make it look like a 3D view, or you can think of it as Google Street-View kind of thing. The whole point is to simulate graphically what a factral structure is.

## Shadow-tree.js

Whenever the user clicks the mouse, a new tree grows up on a random position except position of cube and house. The base environment is set to dessert environment, so the user can replace dessert environment with other environments. If the user wants to increase the level of fracture cube, the user can increase the level by clicking the button, same controls as `Factral.js`. User can also change the color of the cube, same control as `Factral.js`. User can clear all the trees if the simulation is cramped.

## Advanced Features

### Reflection

`Textured_Reflected_Phong` is class that is implemented in GLSL. It is used in `Factral.js` file to simulate metallic look on the cube and the pyramid. We use a sphere mapping background to give that "Google Street-View" look. The reason why we did sphere mapping instead of cube mapping or also known as skybox is because it was a lot easier to implement. By using sphere mapping, we can extract texture one whole polygon instead extracting 6 texture faces of the cube. 

### Shadowing

Shadowing is applied to `shadow-tree.js` to give a realistic view of our factral tree structure. This shadow code was referenced from Wuyue Lu's repo. The idea is that there is an eye vector projected to the objects. We check if the depth of what the eye intersect is under a surface. That is, if the depth from the light point to the eye's intersection point's is larger than the depth from the light point to the closet object intersection, then it is a shadow. This is essentially a z-buffer concept when doing shadowing.

## Reference
- Wuyue Lu's shadow code: https://github.com/Robert-Lu/tiny-graphics-shadow_demo
- Shadow Mapping from learnopengl.com: https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping
- Reflection from webglfundamentals.org: https://webglfundamentals.org/webgl/lessons/webgl-environment-maps.html
- Metallic values: http://devernay.free.fr/cours/opengl/materials.html
- HDRI for sphere mapping background: https://hdrihaven.com/