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
    if (req.method === "GET" && !req.url.includes("?")) {
      const { data, error } = await supabase
        .from("BlogPost")
        .select("*")

      if (error) throw error;
      console.log( "GET BlogPost succeeded", data);
      return new Response(JSON.stringify(data), { headers });
    }

    // Handle GET request with query parameter to fetch a specific post by id
    if (req.method === "GET" && req.url.includes("?")) {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "id query parameter is required" }),
          { status: 400, headers }
        );
      }

      const { data, error } = await supabase
        .from("BlogPost")
        .select("*")
        .eq("id", id)
        .single(); // Only fetch one post with the specified id

      if (error) {
        return new Response(
          JSON.stringify({ error: `Post not found with id ${id}` }),
          { status: 404, headers }
        );
      }

      console.log("GET BlogPost by ID succeeded", data);
      return new Response(JSON.stringify(data), { headers });
    }

    // Handle POST request - add BlogPost
    if (req.method === "POST" && req.url.includes("/create")) {
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

    // Handle POST request - edit BlogPost
    if (req.method === "POST" && req.url.includes("/edit")) {
      const upBlogPost = await req.json();
      console.log(upBlogPost);

      const { data, error } = await supabase
        .from("BlogPost")
        .update({ title: upBlogPost.title, content: upBlogPost.content })
        .eq("id", upBlogPost.id)
        .select();

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: `BlogPost updated! ${data}` }),
        { headers }
      );
    }

    // Handle DELETE request - delete BlogPost
    if (req.method === "DELETE" && req.url.includes("/delete")) {
      const delBlogPost = await req.json();

      const { error } = await supabase
        .from("BlogPost")
        .delete()
        .eq("id", delBlogPost.id);

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