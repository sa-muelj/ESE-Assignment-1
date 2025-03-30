import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req: Request) => {
  // Simple content-type header is all we need
  const headers = { "Content-Type": "application/json" };

  try {
    // Handle GET request - fetch BlogPosts
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("BlogPost")
        .select("*")

      if (error) throw error;
      console.log( "GET BlogPost succeeded", data);
      return new Response(JSON.stringify(data), { headers });
    }

    // Handle POST request - add BlogPost
    if (req.method === "POST") {
      const newBlogPost = await req.json();
      console.log("request: ", newBlogPost.title);
            
      const { data, error } = await supabase
      .from('BlogPost')
      .insert([
        { title: newBlogPost.title, content: newBlogPost.content, author: newBlogPost.author },
      ])
      .select()
        
      console.log(error);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "BlogPost added!", data }),
        { headers }
      );
    }

    // Handle PUT request - edit message
    if (req.method === "PUT") {
      const upBlogPost = await req.json();
      console.log(upBlogPost);

      const { data, error } = await supabase
        .from("BlogPost")
        .update({ content: upBlogPost.content })
        .eq("title", upBlogPost.title)
        .select();

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: `BlogPost updated! ${data}` }),
        { headers }
      );
    }

    // Handle DELETE request - edit message
    if (req.method === "DELETE") {
      const delBlogPost = await req.json();

      const { error } = await supabase
        .from("BlogPost")
        .delete()
        .eq("title", delBlogPost.title);

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: `Message deleted!` }),
        { headers }
      );
    }

    // Handle unsupported methods
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers,
    });
  }
});