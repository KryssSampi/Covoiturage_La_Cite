//using Covoiturage_La_Cite_Server_Core_.Data.Models;
//using Microsoft.EntityFrameworkCore;
//using MongoDB.Driver;

//namespace Covoiturage_La_Cite_Server_Core_.Data.PostgreSQL.Repositories.UserRepository
//{
//    public partial class UserRepository
//    {
//        private readonly AppDbContext _UserContext;
//        public UserRepository(AppDbContext context)
//        {
//            _UserContext = context;
//        }

//        public IQueryable<User> GetAllUsers()
//        {
//            return _UserContext.Users;
//        }
//        public async IAsyncEnumerable<User> GetAllUsersAsync()
//        {
//            await foreach (var user in _UserContext.Users.AsAsyncEnumerable())
//            {
//                yield return user;
//            }
//        }

//        public async Task<User?> GetUserByEmailAsync(string email)
//        {
//            return await _UserContext.Users
//                .FirstOrDefaultAsync(u => u.Email == email);
//        }

//        public async Task<User?> GetUserByIdAsync(Guid id)
//        {
//            return await _UserContext.Users.FindAsync(id);
//        }
//        public async Task AddUserAsync(User user)
//        {
//            await _UserContext.Users.AddAsync(user);
//            await _UserContext.SaveChangesAsync();
//        }
//        public async Task UpdateUserAsync(User user)
//        {
//            _UserContext.Users.Update(user);
//            await _UserContext.SaveChangesAsync();
//        }

//        public async Task DeleteUserAsync(Guid id)
//        {
//            var user = await GetUserByIdAsync(id);
//            if (user != null)
//            {
//                _UserContext.Users.Remove(user);
//                await _UserContext.SaveChangesAsync();
//            }
//        }

//    }
//}
