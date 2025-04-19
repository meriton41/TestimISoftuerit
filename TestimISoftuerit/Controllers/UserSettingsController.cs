using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedClassLibrary.Models;
using TestimISoftuerit.Data;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace TestimISoftuerit.Controllers
{
  [Authorize]
  [Route("api/[controller]")]
  [ApiController]
  public class UserSettingsController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public UserSettingsController(ApplicationDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserSettings()
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized();

        var userSettings = await _context.UserSettings
          .FirstOrDefaultAsync(us => us.UserId == userId);
        return Ok(userSettings);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUserSettings([FromBody] UserSettings userSettings)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized();

        userSettings.UserId = userId;

        _context.UserSettings.Add(userSettings);
        await _context.SaveChangesAsync();
        return Ok(userSettings);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUserSettings(int id, [FromBody] UserSettings userSettings)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var existingUserSettings = await _context.UserSettings.FindAsync(id);
        if (existingUserSettings == null)
          return NotFound();

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || existingUserSettings.UserId != userId)
          return Unauthorized();

        existingUserSettings.Theme = userSettings.Theme;
        existingUserSettings.Language = userSettings.Language;
        existingUserSettings.EmailNotifications = userSettings.EmailNotifications;

        await _context.SaveChangesAsync();
        return Ok(existingUserSettings);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserSettings(int id)
    {
      try
      {
        var userSettings = await _context.UserSettings.FindAsync(id);
        if (userSettings == null)
          return NotFound();

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || userSettings.UserId != userId)
          return Unauthorized();

        _context.UserSettings.Remove(userSettings);
        await _context.SaveChangesAsync();
        return Ok();
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }
  }
}