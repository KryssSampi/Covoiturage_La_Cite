//namespace covoiturageAPI.Middlewares
//{
//    public class ExceptionMiddleware
//    {
//        private readonly RequestDelegate _next;

//        public ExceptionMiddleware(RequestDelegate next)
//        {
//            _next = next;
//        }

//        public async Task InvokeAsync(HttpContext context)
//        {
//            try
//            {
//                await _next(context);
//            }
//            catch (UnauthorizedAccessException ex)
//            {
//                context.Response.StatusCode = 401;
//                await context.Response.WriteAsJsonAsync(new { message = ex.Message });
//            }
//            catch (Exception)
//            {
//                context.Response.StatusCode = 500;
//                await context.Response.WriteAsJsonAsync(new { message = "Erreur serveur." });
//            }
//        }
//    }
//}

using System.Net;
using covoiturageAPI.Exceptions;

namespace covoiturageAPI.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }

            // 🔥 GESTION DES EXCEPTIONS MÉTIER
            catch (BusinessException ex)
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                await context.Response.WriteAsJsonAsync(new
                {
                    code = ex.Code,
                    message = ex.Message
                });
            }

            // 🔐 Cas spécifique auth si tu veux garder 401
            catch (UnauthorizedAccessException ex)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;

                await context.Response.WriteAsJsonAsync(new
                {
                    code = "UNAUTHORIZED",
                    message = ex.Message
                });
            }

            // 💥 Erreur technique
            catch (Exception)
            {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                await context.Response.WriteAsJsonAsync(new
                {
                    code = "SERVER_ERROR",
                    message = "Erreur serveur."
                });
            }
        }
    }
}
