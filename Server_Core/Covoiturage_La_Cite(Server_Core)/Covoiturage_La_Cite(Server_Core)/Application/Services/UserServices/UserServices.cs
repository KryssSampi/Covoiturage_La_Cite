//using Covoiturage_La_Cite_Server_Core_.Data.Models;
//using Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.UserRepository;

//namespace Covoiturage_La_Cite_Server_Core_.Application.Services.UserServices
//{
//    public partial class UserServices
//    {
//        private readonly UserRepository _userRepository;
//        public UserServices(UserRepository userRepository)
//        {
//            _userRepository = userRepository;
//        }

//        public async Task<Data.Models.User?> GetUserByEmailAsync(string email)
//        {
//            return await _userRepository.GetUserByEmailAsync(email);
//        }
//        public async Task<Data.Models.User?> GetUserByIdAsync(Guid id)
//        {
//            return await _userRepository.GetUserByIdAsync(id);
//        }
//        public async Task AddUserAsync(Data.Models.User user)
//        {
//            await _userRepository.AddUserAsync(user);
//        }
//        public async Task UpdateUserAsync(Data.Models.User user)
//        {
//            await _userRepository.UpdateUserAsync(user);
//        }
//        public async Task DeleteUserAsync(Guid id)
//        {
//            await _userRepository.DeleteUserAsync(id);
//        }
//        public IEnumerable<User> GetAllUsers()
//        {
//            foreach (var user in _userRepository.GetAllUsers())
//            {
//                yield return user;
//            }
//        }
//        public async IAsyncEnumerable<Data.Models.User> GetAllUsersAsync()
//        {
//            await foreach (var user in _userRepository.GetAllUsersAsync())
//            {
//                yield return user;
//            }
//        }
//    }
//}
