import { InputError } from "@/server/errors";
export function toErrorResponse(error:unknown):Response {
 if(error instanceof InputError)return Response.json({error:error.message},{status:error.status});
 console.error(error);return Response.json({error:error instanceof Error?error.message:"Erro interno ao processar a requisição."},{status:500});
}
