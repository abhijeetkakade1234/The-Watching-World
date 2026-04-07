from PIL import Image
import os

def analyze_and_process():
    input_path = r'd:\The-Watching-World\public\characters\boy\hero_spritesheet.png'
    output_dir = r'd:\The-Watching-World\public\characters\boy'
    
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    print(f"Original size: {w}x{h}")
    
    # Analyze common colors (especially background)
    # We sample some pixels that are definitely BG (e.g. top left)
    bg_color_1 = img.getpixel((0, 0))
    bg_color_2 = img.getpixel((0, 10)) # Should be different if checkerboard
    print(f"Sampled BG colors: {bg_color_1}, {bg_color_2}")
    
    # Map directions to row index
    directions = ["down", "left", "right", "up"]
    cols = 6
    rows = 4
    
    frame_w = w // cols
    frame_h = h // rows
    print(f"Calculated Frame size: {frame_w}x{frame_h}")
    
    # We'll also try to remove the background by making bg_color_1 and bg_color_2 transparent
    # Alternatively, we can use a more robust way: anything that isn't roughly the character colors
    # or just replace the specific checker matches.
    
    # Create the frames
    images_generated = []
    for r in range(rows):
        for c in range(cols):
            left = c * frame_w
            top = r * frame_h
            right = left + frame_w
            bottom = top + frame_h
            
            frame = img.crop((left, top, right, bottom))
            
            # Simple background removal for specific sampled colors
            datas = frame.getdata()
            new_data = []
            for item in datas:
                # If color is close to bg_color_1 or bg_color_2, set alpha to 0
                # Using a small threshold for "close enough" 
                def is_near(c1, c2, threshold=10):
                    return all(abs(c1[i] - c2[i]) < threshold for i in range(3))
                
                if is_near(item, bg_color_1) or is_near(item, bg_color_2):
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append(item)
            
            frame.putdata(new_data)
            
            # Save frame
            file_name = f"leo_{directions[r]}_{c}.png"
            file_path = os.path.join(output_dir, file_name)
            frame.save(file_path)
            images_generated.append(file_name)
            
    print(f"Successfully generated {len(images_generated)} sprites in {output_dir}")

if __name__ == "__main__":
    analyze_and_process()
