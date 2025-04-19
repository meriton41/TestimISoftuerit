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
  public class CategoryController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public CategoryController(ApplicationDbContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        // Get both user-specific and global categories
        var categories = await _context.Categories
          .Where(c => c.UserId == null || c.UserId == userId)
          .ToListAsync();

        return Ok(categories);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var category = await _context.Categories
          .FirstOrDefaultAsync(c => c.Id == id && (c.UserId == null || c.UserId == userId));

        if (category == null)
          return NotFound();

        return Ok(category);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        // Set the user ID for the category
        category.UserId = userId;

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
    {
      try
      {
        if (!ModelState.IsValid)
          return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var existingCategory = await _context.Categories
          .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (existingCategory == null)
          return NotFound();

        // Only allow updating user-specific categories
        if (existingCategory.UserId == null)
          return BadRequest("Cannot update global categories");

        existingCategory.Name = category.Name;
        existingCategory.Type = category.Type;

        await _context.SaveChangesAsync();
        return Ok(existingCategory);
      }
      catch (Exception ex)
      {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
      try
      {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
          return Unauthorized("User not found");

        var category = await _context.Categories
          .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
          return NotFound();

        // Only allow deleting user-specific categories
        if (category.UserId == null)
          return BadRequest("Cannot delete global categories");

        // Check if category is in use
        var isInUse = await _context.Expenses.AnyAsync(e => e.CategoryId == id) ||
                     await _context.Incomes.AnyAsync(i => i.CategoryId == id);

        if (isInUse)
          return BadRequest("Cannot delete category that is in use");

        _context.Categories.Remove(category);
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