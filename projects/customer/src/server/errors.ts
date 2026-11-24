export class InputError extends Error { readonly status:400|404|415; constructor(message:string,status:400|404|415=400){super(message);this.name="InputError";this.status=status;} }
