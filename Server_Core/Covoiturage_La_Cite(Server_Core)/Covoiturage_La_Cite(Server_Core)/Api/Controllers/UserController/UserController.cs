//using Covoiturage_La_Cite_Server_Core_.Application.Services.UserServices;
//using Microsoft.AspNetCore.Mvc;

//namespace Covoiturage_La_Cite_Server_Core_.Api.Controllers.UserController
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public partial class UserController : ControllerBase
//    {
//        private readonly UserServices _userServices;
//        public UserController(UserServices userServices)
//        {
//            _userServices = userServices;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAllUsers()
//        {
//            var users = _userServices.GetAllUsers();
//            return Ok(users);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetUserById(Guid id)
//        {
//            var user = await _userServices.GetUserByIdAsync(id);
//            if (user == null)
//            {
//                return NotFound();
//            }
//            return Ok(user);

//        }

//        [HttpPost]
//        public async Task<IActionResult> CreateUser(Data.Models.User user)
//        {
//            await _userServices.AddUserAsync(user);
//            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
//        }

//        [HttpPut("{id}")]

//        public async Task<IActionResult> UpdateUser(Guid id, Data.Models.User user)
//        {
//            if (id != user.Id)
//            {
//                return BadRequest();
//            }
//            await _userServices.UpdateUserAsync(user);
//            return NoContent();
//        }
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteUser(Guid id)
//        {
//            await _userServices.DeleteUserAsync(id);
//            return NoContent();
//        }
//    }
//}