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
    // Handle POST request - get User from Username
    if (req.method === "POST") {
      const userReq = await req.json();
      console.log("Username req: ", userReq.username);
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("username", userReq.username);

      if (error) throw error;
      console.log( "GET BlogPost succeeded", data);
      return new Response(JSON.stringify(data), { headers });
    }

    // Handle PUT request - add User
    if (req.method === "PUT") {
      const newUser = await req.json();
      console.log("request: ", newUser.username + " " + newUser.hashedPassword);
            
      const { data, error } = await supabase
      .from('User')
      .insert([
        { username: newUser.username, password: newUser.hashedPassword },
      ])
      .select()
        
      console.log(error);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, message: "User created!", data }),
        { headers }
      );
    }

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