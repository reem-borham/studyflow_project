//  const url = isLogin
//       ? "http://localhost:8000/api/login/"
//       : "http://localhost:8000/api/signup/"
//     const body = isLogin
//       ? JSON.stringify({ username, password })
//       : JSON.stringify({ username, full_name: fullName, password })

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body,
//       })

//       if (!response.ok) {
//         // Try to get a specific error message from the server's JSON response
//         let errorData
//         try {
//           errorData = await response.json()
//         } catch (jsonError) {
//           // If the body isn't JSON or is empty, fall back to the status text
//           throw new Error(
//             response.statusText || "An unknown network error occurred."
//           )
//         }
//         throw new Error(errorData.error || "An unknown error occurred.")
//       }

//       const data = await response.json()
//       // Assuming the token should be stored for session management
//       localStorage.setItem("user", JSON.stringify(data))

//       console.log(
//         isLogin ? "Login successful" : "Registration successful",
//         data
//       )


//       export interface Post {
//   id: number
//   parent_id: number | null
//   base_number: number | null
//   operation: string | null
//   operand: number | null
//   author: string
//   created_at: string
// }

// export interface TreeNode extends Post {
//   children: TreeNode[]
//   result: number
// }

// export interface NewPostPayload {
//   parent_id?: number | null
//   base_number?: number | null
//   operation?: string | null
//   operand?: number | null
// }

// export const fetchPosts = async (): Promise<Post[]> => {
//   const response = await fetch("http://localhost:3000/api/posts")
//   if (!response.ok) {
//     throw new Error("Failed to fetch posts")
//   }
//   return response.json()
// }